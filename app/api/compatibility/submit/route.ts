import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/options";
import compatibilityModel from "@/models/Compatibility";
import testresponseModel from "@/models/TestResponse";
import resultModel from "@/models/ResultInsights";
import relationshipModel from "@/models/Relationship";
import mongoose, { Document, Types } from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

// Types for responses
interface UserResponse {
  questionId: string;
  response_text?: string;
  selected_option?: string;
}

// Interface for MongoDB documents
interface MongoTestResponse extends Document {
  compatibilityId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  testquestionId: mongoose.Types.ObjectId | string;
  response_text?: string;
  selected_option?: string;
  [key: string]: any; // For additional mongoose document properties
}

interface GeminiAnalysisResult {
  score: number;
  strengths: Array<{
    area: string;
    details: string;
  }>;
  weaknesses: Array<{
    area: string;
    details: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
  }>;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { compatibilityId, responses } = await req.json() as { 
      compatibilityId: string; 
      responses: UserResponse[] 
    };

    // Save final responses
    for (const response of responses) {
      await testresponseModel.findOneAndUpdate(
        { 
          compatibilityId, 
          userId: session.user._id, 
          testquestionId: response.questionId 
        },
        { 
          response_text: response.response_text, 
          selected_option: response.selected_option 
        },
        { upsert: true }
      );
    }

    // Update compatibility test status
    const compatibility = await compatibilityModel.findById(compatibilityId);
    if (!compatibility) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Determine which user completed the test
    const databaseRelationshipId = new mongoose.Types.ObjectId(compatibility.relationshipId);
    const relationship = await relationshipModel.findById({_id: databaseRelationshipId});
    if (!relationship) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    // Determine which user completed the test based on relationship roles
    const isUser1 = relationship.user_sender_id.toString() === session.user._id.toString();
    const updateField = isUser1 ? "user1_completed" : "user2_completed";

    await compatibilityModel.findByIdAndUpdate(compatibilityId, { [updateField]: true });

    // Check if both users have completed
    const updatedCompatibility = await compatibilityModel.findById(compatibilityId);
    if (updatedCompatibility?.user1_completed && updatedCompatibility?.user2_completed) {
      // Get all responses for analysis - use lean() to get plain objects
      const allResponses = await testresponseModel.find({ compatibilityId }).lean();
      
      // Get analysis from Gemini
      const analysisResult = await getGeminiAnalysis(allResponses);
      
      const { score, strengths, weaknesses, suggestions } = analysisResult;

      // Update compatibility score
      await compatibilityModel.findByIdAndUpdate(compatibilityId, { 
        score, 
        test_status: "Completed" 
      });

      // Create result insight
      await resultModel.create({
        compatibilityId,
        score,
        strengths,
        weaknesses,
        suggestions
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ completed: true });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}

// Helper function to get complete analysis from Gemini
async function getGeminiAnalysis(responses: Record<string, any>[]): Promise<GeminiAnalysisResult> {
  try {
    // Organize responses by question ID and user ID
    const organizedResponses: Record<string, Record<string, string>> = {};
    const userIds = new Set<string>();
    
    responses.forEach(response => {
      const questionId = response.testquestionId?.toString();
      const userId = response.userId?.toString();
      
      if (!questionId || !userId) return;
        
      userIds.add(userId);
      
      if (!organizedResponses[questionId]) {
        organizedResponses[questionId] = {};
      }
        
      // Store the response text or selected option
      if (response.response_text) {
        organizedResponses[questionId][userId] = response.response_text;
      } else if (response.selected_option) {
        organizedResponses[questionId][userId] = response.selected_option;
      }
    });
    
    if (userIds.size !== 2) {
      throw new Error("Expected responses from exactly 2 users");
    }
        
    const userIdsList = Array.from(userIds);
    const user1Id = userIdsList[0];
    const user2Id = userIdsList[1];
    
    // Format the responses for Gemini
    const formattedResponses = [];
    
    for (const questionId in organizedResponses) {
      const userResponses = organizedResponses[questionId];
      
      if (userResponses[user1Id] && userResponses[user2Id]) {
        const user1Response = userResponses[user1Id];
        const user2Response = userResponses[user2Id];
        
        // Skip empty responses
        if (!user1Response || !user2Response) {
          continue;
        }
        
        formattedResponses.push({
          questionId,
          person1Response: user1Response,
          person2Response: user2Response
        });
      }
    }
    
    // Use Gemini to analyze responses and generate score and insights
    return await generateGeminiAnalysis(formattedResponses);
  } catch (error) {
    console.error(`Error during analysis: ${error instanceof Error ? error.message : String(error)}`);
    // Return default analysis
    return generateDefaultAnalysis();
  }
}

// Function to generate analysis using Gemini API
async function generateGeminiAnalysis(
  formattedResponses: Array<{
    questionId: string;
    person1Response: string;
    person2Response: string;
  }>
): Promise<GeminiAnalysisResult> {
  try {
    const allResponses = formattedResponses.map(r => 
      `- Question ${r.questionId}: Person A said "${r.person1Response}" and Person B said "${r.person2Response}"`
    ).join("\n");
    
    // Create prompt for Gemini
    const geminiPrompt = `
      As a relationship compatibility analyst, analyze these responses from two people taking a compatibility test.
      
      COMPATIBILITY TEST RESPONSES:
      ${allResponses}

      Based on these responses, I need you to:
      
      1. Calculate a compatibility score between 0-100 based on how aligned their responses are
      2. Identify three specific areas of strength in their relationship (be specific about what they align on)
      3. Identify three potential challenge areas they should be aware of (be specific about their differences)
      4. Provide four practical suggestions for improving their relationship compatibility
      
      When analyzing, consider:
      - Similar responses indicate alignment in values, preferences and communication styles
      - Different responses highlight potential areas of conflict or misalignment
      - Consider both the content and tone of responses
      - Look for patterns across multiple questions
      
      Format your response as JSON with these keys:
      - "score": A number between 0-100 representing overall compatibility
      - "strengths": Array of objects with "area" and "details" fields
      - "weaknesses": Array of objects with "area" and "details" fields
      - "suggestions": Array of objects with "title" and "description" fields
      
      Keep each field brief but insightful - no more than 2 sentences per field.
      Response must be valid JSON that can be parsed with JSON.parse().
    `;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate analysis
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    const responseText = result.response.text();
    
    // Parse JSON response
    try {
      // Find JSON content in the response
      const startIdx = responseText.indexOf('{');
      const endIdx = responseText.lastIndexOf('}') + 1;
      
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonContent = responseText.substring(startIdx, endIdx);
        const parsedResult = JSON.parse(jsonContent) as GeminiAnalysisResult;
        
        // Validate the score is a number between 0-100
        if (typeof parsedResult.score !== 'number' || parsedResult.score < 0 || parsedResult.score > 100) {
          parsedResult.score = 70; // Default fallback score
        }
        
        return parsedResult;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (jsonError) {
      console.error(`Error parsing Gemini response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      // Fallback to default analysis
      return generateDefaultAnalysis();
    }
  } catch (error) {
    console.error(`Error generating Gemini analysis: ${error instanceof Error ? error.message : String(error)}`);
    return generateDefaultAnalysis();
  }
}

// Function to generate default analysis
function generateDefaultAnalysis(): GeminiAnalysisResult {
  return {
    score: 70,
    strengths: [
      {area: "Communication Style", details: "Partners show similar communication patterns in their responses."},
      {area: "Values Alignment", details: "Core values appear to be well-aligned based on response similarity."},
      {area: "Problem Solving", details: "Both partners approach challenges with compatible strategies."}
    ],
    weaknesses: [
      {area: "Emotional Expression", details: "Different approaches to expressing feelings may cause misunderstandings."},
      {area: "Personal Space", details: "Different needs for independence versus togetherness."},
      {area: "Conflict Resolution", details: "Different approaches to handling disagreements."}
    ],
    suggestions: [
      {title: "Schedule Regular Check-ins", description: "Set aside time weekly to discuss relationship matters openly."},
      {title: "Practice Active Listening", description: "Focus on understanding your partner's perspective before responding."},
      {title: "Respect Differences", description: "Acknowledge that differences can strengthen your relationship when understood."},
      {title: "Seek Common Ground", description: "Build on your shared values and interests to strengthen your connection."}
    ]
  };
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Debug counter for requests
let requestCounter = 0;
const requestTimestamps: number[] = [];

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Increment and log request counter
    requestCounter++;
    const now = Date.now();
    requestTimestamps.push(now);
    
    // Clean up old timestamps (older than 1 minute)
    const oneMinuteAgo = now - 60000;
    while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
      requestTimestamps.shift();
    }
    
    // Log request stats
    console.log(`Request #${requestCounter} | Requests in last minute: ${requestTimestamps.length}`);
    console.log(`API Key first 4 chars: ${process.env.GEMINI_API_KEY?.substring(0, 4) || 'NOT SET'}`);
    
    // Parse the request body to get any input parameters from the client
    const { userQuestion } = await request.json();
    
    // Calculate prompt length
    const relationshipAdvisorPrompt = `
      You are a compassionate and knowledgeable relationship advisor chatbot. Your role is to provide thoughtful guidance, 
      support, and advice on relationships of all types - romantic, family, friendship, and professional.
      
      Be empathetic and non-judgmental in all responses. Provide balanced perspectives that acknowledge relationship complexity.
      Support healthy communication, boundaries, and mutual respect. Recognize cultural differences in relationship dynamics.
      Suggest practical, actionable advice when appropriate.
      
      Use a warm, conversational tone that makes users feel heard and understood. Structure responses clearly by validating 
      feelings, exploring perspectives, and offering guidance. Balance emotional support with practical advice.
      
      Always prioritize the emotional and physical safety of all parties. Recommend professional therapy/counseling for 
      serious issues. Never encourage manipulation, dishonesty, or harmful behavior.
      
      make short conversation not generate the large message if question is not very important and if out of scope so please avoid it
      
      Respond to this user question about relationships: ${userQuestion || "Please share a relationship concern or question."}
    `;
    
    console.log(`Prompt length: ${relationshipAdvisorPrompt.length} characters`);
    // Rough token estimate (very approximate)
    const estimatedTokens = Math.ceil(relationshipAdvisorPrompt.length / 4);
    console.log(`Estimated tokens: ~${estimatedTokens}`);
    
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Log before API call
    console.log(`Making API call to Gemini...`);
    
    // Generate content with the relationship advisor context
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: relationshipAdvisorPrompt }] }]
    });
    
    // Log success
    console.log(`API call successful!`);
    
    // Extract the text from the response
    const text = result.response.text();
    
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    
    // Check for common quota-related patterns in the error
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      console.error("QUOTA ERROR DETECTED. Details:");
      console.error(`- Total requests tracked: ${requestCounter}`);
      console.error(`- Requests in last minute: ${requestTimestamps.length}`);
      
      // Try to extract quota specifics
      try {
        const quotaInfo = errorMsg.match(/quotaMetric":"([^"]+)"/g);
        if (quotaInfo) {
          console.error("Quota metrics:");
          quotaInfo.forEach(m => console.error(`  ${m}`));
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // More detailed error handling
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Failed to generate response", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
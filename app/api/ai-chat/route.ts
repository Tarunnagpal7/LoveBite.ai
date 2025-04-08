import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Parse the request body to get any input parameters from the client
    const { userQuestion } = await request.json();
    
    // Define the relationship advisor prompt context
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

    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate content with the relationship advisor context
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: relationshipAdvisorPrompt }] }]
    });
    
    // Extract the text from the response
    const text = result.response.text();
    
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    
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
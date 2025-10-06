import { NextResponse } from 'next/server';
import { qaService } from '@/lib/qa-service';
import { openaiService } from '@/lib/openai-service';

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // First try to find an answer in our custom Q&A data
    const customAnswer = qaService.getAnswer(message);
    
    if (customAnswer) {
      // If we have a custom answer, return it directly
      return NextResponse.json({
        id: Math.random().toString(36).substring(2, 10),
        content: customAnswer,
        timestamp: new Date().toISOString(),
      });
    }
    
    // If no custom answer, use OpenAI as fallback
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        id: 'no-api-key',
        content: "I'm sorry, but I'm currently unable to process your request due to a configuration issue. Please try again later or contact support.",
        timestamp: new Date().toISOString(),
      });
    }
    
    try {
      // Use the openaiService to generate a response
      const aiResponse = await openaiService.generateChatCompletion(
        message,
        conversationHistory
      );
      
      return NextResponse.json({
        id: aiResponse.id || Math.random().toString(36).substring(2, 10),
        content: aiResponse.content,
        timestamp: aiResponse.timestamp.toISOString(),
      });
    } catch (aiError) {
      console.error('OpenAI service error:', aiError);
      return NextResponse.json({
        id: 'ai-error',
        content: "I'm sorry, I couldn't generate a response. Please try again later.",
        timestamp: new Date().toISOString(),
      });
    }
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

// Interface for feedback request
interface FeedbackRequest {
  messageId: string;
  isHelpful: boolean;
  comment?: string;
  source?: 'custom_qa' | 'openai';
}

/**
 * POST handler for chat feedback
 * This endpoint collects user feedback on chat responses for analytics
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as FeedbackRequest;
    
    // Validate required fields
    if (!body.messageId || typeof body.isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a production environment, this would store feedback in a database
    // For now, we'll just log it to the console
    console.log('Feedback received:', {
      messageId: body.messageId,
      isHelpful: body.isHelpful,
      comment: body.comment || '',
      source: body.source || 'unknown',
      timestamp: new Date().toISOString(),
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Feedback received',
    });
    
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

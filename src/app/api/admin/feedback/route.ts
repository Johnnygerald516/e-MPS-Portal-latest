import { NextResponse } from 'next/server';

// Mock database of feedback entries
// In a real application, this would be stored in a database
const feedbackDatabase: any[] = [];

/**
 * GET handler for admin feedback data
 * This endpoint returns all collected feedback for analysis
 */
export async function GET(request: Request) {
  try {
    // In a real application, you would:
    // 1. Authenticate the request to ensure it's from an admin
    // 2. Retrieve feedback data from a database
    // 3. Apply any filters from query parameters
    
    // For demo purposes, we'll return the mock database
    // or generate some sample data if empty
    const feedbackData = feedbackDatabase.length > 0 
      ? feedbackDatabase 
      : generateSampleFeedback();
    
    return NextResponse.json({
      success: true,
      data: feedbackData
    });
    
  } catch (error) {
    console.error('Error retrieving feedback data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback data' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for admin feedback data
 * This endpoint allows storing feedback from the client
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.messageId || typeof body.isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Add to mock database
    feedbackDatabase.push({
      ...body,
      timestamp: body.timestamp || new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Feedback stored successfully'
    });
    
  } catch (error) {
    console.error('Error storing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to store feedback' },
      { status: 500 }
    );
  }
}

/**
 * Generate sample feedback data for demonstration purposes
 */
function generateSampleFeedback() {
  const sources = ['custom_qa', 'openai'];
  const topics = [
    'application process', 
    'required documents', 
    'fees', 
    'processing time', 
    'technical issues'
  ];
  
  const sampleData = [];
  
  // Generate 20 sample feedback entries
  for (let i = 0; i < 20; i++) {
    const isHelpful = Math.random() > 0.3; // 70% helpful
    const source = sources[Math.floor(Math.random() * sources.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    sampleData.push({
      messageId: `sample-${i}-${Date.now()}`,
      isHelpful,
      comment: isHelpful ? undefined : `Could provide more details about ${topic}`,
      source,
      topic,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() // Random date within last week
    });
  }
  
  return sampleData;
}

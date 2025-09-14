import { NextRequest, NextResponse } from 'next/server';

/**
 * POST handler for verification endpoint
 * Handles both new application and renewal verification
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log('Verification request body:', body);

    // Check if this is a renewal or new application verification
    const isRenewal = body.passNumber !== undefined;
    
    if (isRenewal) {
      // Handle renewal verification
      const { passNumber, subjectId, phoneNumber } = body;
      
      // Validate required fields
      if (!passNumber || !subjectId || !phoneNumber) {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Missing required fields for renewal verification"
        }, { status: 400 });
      }
      
      // In a real application, you would validate these against your database
      // For now, we'll simulate a successful verification
      
      // Generate a unique application ID for renewal
      const applicationID = `EMPS${Math.floor(Math.random() * 1000000000).toString().padStart(12, '0')}`;
      
      return NextResponse.json({
        ackCode: 1,
        ackMessage: "Success",
        jsonResult: {
          applicationID,
          phoneNo: phoneNumber
        }
      });
    } else {
      // Handle new application verification
      const { subjectId, dateOfBirth, region } = body;
      
      // Validate required fields
      if (!subjectId || !dateOfBirth || !region) {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Missing required fields for new application verification"
        }, { status: 400 });
      }
      
      // In a real application, you would validate these against your database
      // For now, we'll simulate a successful verification
      
      // Generate a unique application ID for new application
      const applicationID = `EMPS${Math.floor(Math.random() * 1000000000).toString().padStart(12, '0')}`;
      
      // Generate a phone number based on the subjectId or use a default
      const phoneNo = subjectId.length >= 9 
        ? `0${subjectId.slice(-9)}` 
        : "0000000000"; // Default phone number if subjectId is too short
      
      return NextResponse.json({
        ackCode: 1,
        ackMessage: "Success",
        jsonResult: {
          applicationID,
          phoneNo
        }
      });
    }
  } catch (error) {
    console.error('Error in verification API:', error);
    return NextResponse.json({
      ackCode: 0,
      ackMessage: "Server error during verification"
    }, { status: 500 });
  }
}

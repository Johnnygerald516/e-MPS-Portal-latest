import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Get the file parameter from the URL
    const url = new URL(req.url);
    const fileParam = url.searchParams.get('file');

    if (!fileParam) {
      return new NextResponse('File parameter is required', { status: 400 });
    }

    // Define the base path for PDF files
    const basePath = path.join(process.cwd(), 'src', 'assets', 'muongozo');
    
    // Construct the file path
    const filePath = path.join(basePath, fileParam);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileParam}"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

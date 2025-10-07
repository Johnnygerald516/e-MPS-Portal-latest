import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config/api-config';

export async function GET() {
  // Get API URL from different sources to debug
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const configApiUrl = getApiUrl();
  
  return NextResponse.json({
    // Environment variables
    env: {
      NEXT_PUBLIC_API_URL: envApiUrl,
      NODE_ENV: process.env.NODE_ENV,
    },
    // Config values
    config: {
      apiUrl: configApiUrl,
    },
    // Server info
    server: {
      time: new Date().toISOString(),
      timestamp: Date.now(),
    }
  });
}

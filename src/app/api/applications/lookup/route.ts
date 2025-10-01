import { NextRequest, NextResponse } from "next/server";

// Define the lookup request interface
interface LookupRequest {
  operationType: string;
  argument1: number;
  argument2: number; 
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData: LookupRequest = await request.json();
    const { operationType, argument1, argument2 } = requestData;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
     return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
          jsonResult: []
        },
        { status: 500 }
      );
    }
    
    const externalApiUrl = `${apiUrl}/applications/lookup`;
    
    try {
      let currentUrl;
      try {
        currentUrl = new URL(externalApiUrl);
      } catch (error) {
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: `Invalid API URL format: ${externalApiUrl}`,
            jsonResult: []
          },
          { status: 500 }
        );
      }
      const isSelfCall = currentUrl.hostname === '10.6.0.164' || 
                         currentUrl.hostname === '10.6.0.165' || 
                         currentUrl.hostname === 'localhost';
      
      if (isSelfCall) {
        return NextResponse.json({
          ackCode: 1,
          ackMessage: "Using fallback data to avoid recursive API call",
          jsonResult: getFallbackData(requestData.operationType, requestData.argument1)
        });
      }
      
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
       return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: `API error: ${response.status} ${response.statusText}`,
            error: errorText,
            jsonResult: []
          },
          { status: response.status }
        );
      }
      
      // Try to parse the response as JSON, with error handling
      try {
        const responseText = await response.text();
        
        // Check if response is empty
        if (!responseText || responseText.trim() === '') {
          return NextResponse.json(
            { 
              ackCode: 0, 
              ackMessage: "Empty response from external API",
              jsonResult: []
            },
            { status: 500 }
          );
        }
        
        // Try to parse the response as JSON
        let apiResponse;
        try {
          apiResponse = JSON.parse(responseText);
        } catch (parseError) {
          return NextResponse.json(
            { 
              ackCode: 0, 
              ackMessage: "Invalid JSON response from API",
              error: responseText.substring(0, 200), // Include part of the response for debugging
              jsonResult: []
            },
            { status: 500 }
          );
        }
    
        return NextResponse.json(apiResponse);
      } catch (textError) {
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: "Error reading API response",
            error: textError instanceof Error ? textError.message : "Unknown error",
            jsonResult: []
          },
          { status: 500 }
        );
      }
      
    } catch (fetchError) {
      const isConnectionRefused = fetchError instanceof Error && 
        (fetchError.message.includes('ECONNREFUSED') || 
         fetchError.message.includes('fetch failed') ||
         fetchError.message.includes('network timeout'));
      
      if (isConnectionRefused) {
        return NextResponse.json(
          { 
            ackCode: 1, 
            ackMessage: "Using fallback data due to connection issue",
            jsonResult: getFallbackData(requestData.operationType, requestData.argument1)
          }
        );
      } else {
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: "Failed to connect to external API",
            error: fetchError instanceof Error ? fetchError.message : "Network error",
            jsonResult: []
          },
          { status: 503 }
        );
      }
    }
    
  } catch (error) {
    return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Failed to process lookup request",
        error: error instanceof Error ? error.message : "Unknown error",
        jsonResult: []
      },
      { status: 500 }
    );
  }
}

// Function to provide fallback data for different operation types
function getFallbackData(operationType: string, argument1: number) {
  switch(operationType.toLowerCase()) {
    case 'occupationtype':
      return [
        { EntryId: 1, OccupationType: "Employed" },
        { EntryId: 2, OccupationType: "Self Employed" },
        { EntryId: 3, OccupationType: "Business Owner" },
        { EntryId: 4, OccupationType: "Student" },
        { EntryId: 5, OccupationType: "Retired" },
        { EntryId: 6, OccupationType: "Unemployed" }
      ];
    
    case 'occupation':
      const occupationsByType: Record<number, any[]> = {
        1: [{ OccupationID: 1, OccupationName: "Full-time Employee" }, { OccupationID: 2, OccupationName: "Part-time Employee" }],
        2: [{ OccupationID: 3, OccupationName: "Freelancer" }, { OccupationID: 4, OccupationName: "Consultant" }],
        3: [{ OccupationID: 5, OccupationName: "Small Business Owner" }, { OccupationID: 6, OccupationName: "Entrepreneur" }],
        4: [{ OccupationID: 7, OccupationName: "University Student" }, { OccupationID: 8, OccupationName: "High School Student" }],
        5: [{ OccupationID: 9, OccupationName: "Retired Professional" }, { OccupationID: 10, OccupationName: "Pensioner" }],
        6: [{ OccupationID: 11, OccupationName: "Job Seeker" }, { OccupationID: 12, OccupationName: "Not Working" }]
      };
      return occupationsByType[argument1] || [];
    
    case 'maritalstatus':
      return [
        { MaritalStatusID: 1, MaritalStatus: "Single", HaliYaNdoa: "Single" },
        { MaritalStatusID: 2, MaritalStatus: "Married", HaliYaNdoa: "Married" },
        { MaritalStatusID: 3, MaritalStatus: "Divorced", HaliYaNdoa: "Divorced" },
        { MaritalStatusID: 4, MaritalStatus: "Widowed", HaliYaNdoa: "Widowed" }
      ];
    
    case 'country':
      return [
        { EntryId: 1, CountryName: "Tanzania" },
        { EntryId: 2, CountryName: "Kenya" },
        { EntryId: 3, CountryName: "Uganda" },
        { EntryId: 4, CountryName: "Rwanda" },
        { EntryId: 5, CountryName: "Burundi" }
      ];
    
    case 'region':
      return [
        { EntryId: 1, RegionName: "Dar es Salaam" },
        { EntryId: 2, RegionName: "Arusha" },
        { EntryId: 3, RegionName: "Mwanza" },
        { EntryId: 4, RegionName: "Dodoma" },
        { EntryId: 5, RegionName: "Zanzibar" }
      ];
    
    case 'district':
      return [
        { EntryId: 1, DistrictName: "Ilala" },
        { EntryId: 2, DistrictName: "Kinondoni" },
        { EntryId: 3, DistrictName: "Temeke" }
      ];
    
    case 'ward':
      return [
        { EntryId: 1, WardName: "Kariakoo" },
        { EntryId: 2, WardName: "Upanga" },
        { EntryId: 3, WardName: "Mwananyamala" }
      ];
    
    case 'nationality':
      return [
        { EntryId: 1, Nationality: "Tanzanian" },
        { EntryId: 2, Nationality: "Kenyan" },
        { EntryId: 3, Nationality: "Ugandan" }
      ];
    
    case 'relationtype':
      return [
        { RelationTypeID: 1, RelationName: "Parent", Uhusiano: "Parent" },
        { RelationTypeID: 2, RelationName: "Spouse", Uhusiano: "Spouse" },
        { RelationTypeID: 3, RelationName: "Child", Uhusiano: "Child" },
        { RelationTypeID: 4, RelationName: "Sibling", Uhusiano: "Sibling" }
      ];
    
    case 'documenttype':
      return [
        { DocumentTypeID: 1, DocumentName: "Passport" },
        { DocumentTypeID: 2, DocumentName: "National ID" },
        { DocumentTypeID: 3, DocumentName: "Birth Certificate" }
      ];
    
    case 'apptype':
      return [
        { ApplicationTypeID: 1, ApplicationTypeNameSwahili: "Ombi Jipya" },
        { ApplicationTypeID: 2, ApplicationTypeNameSwahili: "Kuhuisha" }
      ];
    
    default:
      return [];
  }
}


/**
 * Test utility for the application status API endpoint
 * 
 * This file is not used in production, but can be used to test the API endpoint
 * during development. To use it, run:
 * 
 * node -r ts-node/register src/app/api/applications/status/test.ts
 */

async function testApplicationStatusAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/applications/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: 'EMPS254119114112',
        phoneNumber: '0684649490'
      })
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Uncomment to run the test
// testApplicationStatusAPI();

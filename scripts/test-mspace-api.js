/**
 * Test script for Mspace API endpoints
 * 
 * This script tests different URL formats and request methods for the Mspace API
 * to help diagnose and fix 505 errors.
 * 
 * Usage:
 * 1. Set your API key and username in the config object
 * 2. Run with Node.js: node test-mspace-api.js
 */

const fetch = require('node-fetch');

// Configuration - REPLACE WITH YOUR CREDENTIALS
const config = {
  apiKey: 'YOUR_API_KEY',
  username: 'YOUR_USERNAME',
  endpoints: {
    balance: 'https://api.mspace.co.ke/smsapi/v2/balance',
    resellerClients: 'https://api.mspace.co.ke/smsapi/v2/resellerclients'
  }
};

// Test all combinations of methods and formats
async function testEndpoint(name, url) {
  console.log(`\n=== Testing ${name} endpoint ===\n`);
  
  // Test POST with JSON
  try {
    console.log('POST with JSON:');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username: config.username })
    });
    
    console.log(`Status: ${postResponse.status} ${postResponse.statusText}`);
    const postText = await postResponse.text();
    console.log(`Response: ${postText}`);
    
    try {
      const postJson = JSON.parse(postText);
      console.log('Parsed JSON:', postJson);
    } catch (e) {
      console.log('Not valid JSON, treating as plain text');
    }
  } catch (error) {
    console.error('POST with JSON failed:', error.message);
  }
  
  // Test POST with XML
  try {
    console.log('\nPOST with XML:');
    const xmlResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      body: `<user><username>${config.username}</username></user>`
    });
    
    console.log(`Status: ${xmlResponse.status} ${xmlResponse.statusText}`);
    const xmlText = await xmlResponse.text();
    console.log(`Response: ${xmlText}`);
  } catch (error) {
    console.error('POST with XML failed:', error.message);
  }
  
  // Test GET with format 1 (documented format)
  try {
    console.log('\nGET with format 1 (documented):');
    const getUrl1 = `${url}/apikey=${config.apiKey}/username=${config.username}`;
    console.log(`URL: ${getUrl1}`);
    
    const getResponse1 = await fetch(getUrl1);
    console.log(`Status: ${getResponse1.status} ${getResponse1.statusText}`);
    const getText1 = await getResponse1.text();
    console.log(`Response: ${getText1}`);
    
    try {
      const getJson1 = JSON.parse(getText1);
      console.log('Parsed JSON:', getJson1);
    } catch (e) {
      console.log('Not valid JSON, treating as plain text');
    }
  } catch (error) {
    console.error('GET with format 1 failed:', error.message);
  }
  
  // Test GET with format 2 (standard query parameters)
  try {
    console.log('\nGET with format 2 (standard query parameters):');
    const getUrl2 = `${url}?apikey=${config.apiKey}&username=${config.username}`;
    console.log(`URL: ${getUrl2}`);
    
    const getResponse2 = await fetch(getUrl2);
    console.log(`Status: ${getResponse2.status} ${getResponse2.statusText}`);
    const getText2 = await getResponse2.text();
    console.log(`Response: ${getText2}`);
    
    try {
      const getJson2 = JSON.parse(getText2);
      console.log('Parsed JSON:', getJson2);
    } catch (e) {
      console.log('Not valid JSON, treating as plain text');
    }
  } catch (error) {
    console.error('GET with format 2 failed:', error.message);
  }
}

// Main function to run all tests
async function runTests() {
  console.log('Starting Mspace API tests...');
  console.log('API Key (masked):', `${config.apiKey.substring(0, 4)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
  console.log('Username:', config.username);
  
  // Test balance endpoint
  await testEndpoint('Balance', config.endpoints.balance);
  
  // Test reseller clients endpoint
  await testEndpoint('Reseller Clients', config.endpoints.resellerClients);
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script failed:', error);
});
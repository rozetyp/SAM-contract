#!/usr/bin/env node

// Simple SAM.gov API test script
// Usage: node test-sam-api.js

const API_KEY = 'UcbLnG82TD8rcnXZaJqMpDxezcUVPlxTAfDZMIwo';
const SAM_BASE = 'https://api.sam.gov/opportunities/v2/search';

async function testSamApi() {
  console.log('🧪 Testing SAM.gov API...');
  console.log('🔑 API Key:', API_KEY.substring(0, 8) + '...');
  
  // Very simple test query - just get a few records from today
  const today = new Date().toISOString().split('T')[0];
  const testParams = {
    api_key: API_KEY,
    postedFrom: today,
    postedTo: today,
    limit: '10',
    ptype: 'o', // Just opportunities
  };
  
  const queryString = new URLSearchParams(testParams).toString();
  const url = `${SAM_BASE}?${queryString}`;
  
  console.log('🌐 Request URL:', url.replace(API_KEY, 'XXX'));
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SAM-Contract-Test/1.0'
      }
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    const text = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ API Response Success!');
        console.log('📈 Total Records Available:', data.totalRecords || 'unknown');
        console.log('📄 Records in Response:', data.opportunitiesData?.length || 0);
        
        if (data.opportunitiesData && data.opportunitiesData.length > 0) {
          console.log('🎯 Sample Opportunity:');
          const sample = data.opportunitiesData[0];
          console.log(`  Title: ${sample.title || 'N/A'}`);
          console.log(`  Agency: ${sample.organizationName || 'N/A'}`);
          console.log(`  Posted: ${sample.postedDate || 'N/A'}`);
        }
      } catch (parseError) {
        console.log('✅ API Response received but not JSON:', text.substring(0, 200));
      }
    } else {
      console.log('❌ API Error Response:', text);
      
      if (response.status === 429) {
        console.log('⚠️  Rate Limited - API quota exceeded');
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter) {
          console.log(`⏳ Retry after: ${retryAfter} seconds`);
        }
      } else if (response.status === 401) {
        console.log('🔐 Unauthorized - check API key');
      }
    }
    
  } catch (error) {
    console.error('💥 Network/Fetch Error:', error.message);
  }
}

// Run the test
testSamApi().catch(console.error);

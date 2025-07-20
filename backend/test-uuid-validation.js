const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';

async function testUUIDValidation() {
  console.log('🧪 Testing UUID validation...\n');
  
  // Test 1: Invalid member ID format
  console.log('Test 1: Invalid member ID "8"');
  try {
    const response = await fetch(`${API_URL}/members/8`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify({ name: 'Test Member' })
    });
    
    const data = await response.json();
    if (response.status === 400 && data.error.includes('Invalid member ID format')) {
      console.log('✅ PASS: UUID validation working correctly');
      console.log(`   Response: ${data.error}\n`);
    } else {
      console.log('❌ FAIL: Expected UUID validation error');
      console.log(`   Status: ${response.status}, Response: ${JSON.stringify(data)}\n`);
    }
  } catch (error) {
    console.log('❌ ERROR: Request failed');
    console.log(`   Error: ${error.message}\n`);
  }
  
  // Test 2: Invalid plan ID format
  console.log('Test 2: Invalid plan ID "123"');
  try {
    const response = await fetch(`${API_URL}/plans/123`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify({ name: 'Test Plan' })
    });
    
    const data = await response.json();
    if (response.status === 400 && data.error.includes('Invalid plan ID format')) {
      console.log('✅ PASS: Plan UUID validation working correctly');
      console.log(`   Response: ${data.error}\n`);
    } else {
      console.log('❌ FAIL: Expected plan UUID validation error');
      console.log(`   Status: ${response.status}, Response: ${JSON.stringify(data)}\n`);
    }
  } catch (error) {
    console.log('❌ ERROR: Request failed');
    console.log(`   Error: ${error.message}\n`);
  }
  
  // Test 3: Valid UUID format (should pass validation but fail auth)
  console.log('Test 3: Valid UUID "550e8400-e29b-41d4-a716-446655440000"');
  try {
    const response = await fetch(`${API_URL}/members/550e8400-e29b-41d4-a716-446655440000`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify({ name: 'Test Member' })
    });
    
    const data = await response.json();
    if (response.status === 401 && data.error === 'Invalid token') {
      console.log('✅ PASS: Valid UUID passed validation (failed at auth as expected)');
      console.log(`   Response: ${data.error}\n`);
    } else if (response.status === 404) {
      console.log('✅ PASS: Valid UUID passed validation (member not found as expected)');
      console.log(`   Response: ${data.error}\n`);
    } else {
      console.log('❌ UNEXPECTED: Valid UUID gave unexpected response');
      console.log(`   Status: ${response.status}, Response: ${JSON.stringify(data)}\n`);
    }
  } catch (error) {
    console.log('❌ ERROR: Request failed');
    console.log(`   Error: ${error.message}\n`);
  }
  
  console.log('🎯 UUID validation tests completed!');
}

testUUIDValidation().catch(console.error); 
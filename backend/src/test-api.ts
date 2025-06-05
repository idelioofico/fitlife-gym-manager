import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';
let authToken: string;

async function testSignup() {
  console.log('\nTesting Signup...');
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@fitlife.com',
        password: 'test123',
        role: 'user'
      })
    });
    const data = await response.json();
    console.log('Signup Response:', data);
    if (data.token) {
      authToken = data.token;
    }
  } catch (error) {
    console.error('Signup Error:', error);
  }
}

async function testSignin() {
  console.log('\nTesting Signin...');
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@fitlife.com',
        password: 'test123'
      })
    });
    const data = await response.json();
    console.log('Signin Response:', data);
    if (data.token) {
      authToken = data.token;
    }
  } catch (error) {
    console.error('Signin Error:', error);
  }
}

async function testGetProfiles() {
  console.log('\nTesting Get Profiles...');
  try {
    const response = await fetch(`${API_URL}/profiles`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    console.log('Get Profiles Response:', data);
  } catch (error) {
    console.error('Get Profiles Error:', error);
  }
}

async function testGetRoles() {
  console.log('\nTesting Get Roles...');
  try {
    const response = await fetch(`${API_URL}/roles`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    console.log('Get Roles Response:', data);
  } catch (error) {
    console.error('Get Roles Error:', error);
  }
}

async function testGetMembers() {
  console.log('\nTesting Get Members...');
  try {
    const response = await fetch(`${API_URL}/members`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    console.log('Get Members Response:', data);
  } catch (error) {
    console.error('Get Members Error:', error);
  }
}

async function testGetClasses() {
  console.log('\nTesting Get Classes...');
  try {
    const response = await fetch(`${API_URL}/classes`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    console.log('Get Classes Response:', data);
  } catch (error) {
    console.error('Get Classes Error:', error);
  }
}

async function testGetSettings() {
  console.log('\nTesting Get Settings...');
  try {
    const response = await fetch(`${API_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    console.log('Get Settings Response:', data);
  } catch (error) {
    console.error('Get Settings Error:', error);
  }
}

async function runTests() {
  console.log('Starting API Tests...');
  
  // Test signup
  await testSignup();
  
  // Test signin
  await testSignin();
  
  // Test protected routes
  if (authToken) {
    await testGetProfiles();
    await testGetRoles();
    await testGetMembers();
    await testGetClasses();
    await testGetSettings();
  } else {
    console.error('No auth token available. Skipping protected route tests.');
  }
  
  console.log('\nAPI Tests Completed!');
}

runTests().catch(console.error); 
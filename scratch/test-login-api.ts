import axios from 'axios';

async function testLoginApi() {
  console.log('Testing HTTP POST to http://localhost:5000/api/auth/login ...');
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@ramjicollection.com',
      password: 'Admin@123'
    });
    console.log('✅ Response Status:', res.status);
    console.log('✅ Response Data:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('❌ Error Status:', err.response?.status);
    console.error('❌ Error Data:', err.response?.data || err.message);
  }
}

testLoginApi();

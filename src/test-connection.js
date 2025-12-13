// Simple test to check if frontend can reach proxy server
console.log('🧪 Testing frontend to proxy server connection...');

fetch('http://3.29.217.13:3001/api/test')
  .then(response => {
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('✅ Success! Proxy server response:', data);
  })
  .catch(error => {
    console.error('❌ Error connecting to proxy server:', error);
    console.error('Error details:', error.message);
  });

import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green' }}>✅ React is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestApp;

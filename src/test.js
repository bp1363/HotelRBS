// Simple vanilla JavaScript test
console.log('Vanilla JavaScript test starting...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = '<h1 style="color: red;">Root element not found</h1>';
} else {
  console.log('Root element found');
  
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #e0f0ff; border: 2px solid #007bff; margin: 20px;">
      <h1 style="color: #007bff;">✅ Vanilla JavaScript is Working!</h1>
      <p>If you can see this, JavaScript is executing correctly.</p>
      <p>Time: ${new Date().toLocaleTimeString()}</p>
    </div>
  `;
  
  console.log('Vanilla JavaScript test successful!');
}

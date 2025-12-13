import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./responsive.css";

// Restore the full HotelRBS app
try {
  console.log('Starting HotelRBS app...');
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering App component...');
  root.render(<App />);
  
  console.log('HotelRBS app rendered successfully!');
} catch (error) {
  console.error('App error:', error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #ffe0e0; border: 2px solid #ff0000; margin: 20px;">
        <h1 style="color: #ff0000;">❌ App Error</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import './styles/App.css';

// Set Buffer for Solana
window.Buffer = Buffer;

// Mount the full app with proper routing
const root = document.getElementById('root');

// Simple error handling
try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log("App mounted successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  
  // Show error on page
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background-color: #1F2937; color: white; border-radius: 10px; margin: 20px;">
        <h2 style="color: #EF4444;">Error Loading Application</h2>
        <p>There was a problem loading the application:</p>
        <pre style="background-color: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; overflow: auto;">${error.message}</pre>
        <p style="margin-top: 20px;">Please check the console for more details.</p>
      </div>
    `;
  }
}
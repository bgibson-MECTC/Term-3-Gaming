import React, { useState } from 'react';
import './index.css';

// Lazy load components to catch import errors
let RNMasteryGame;
let importError = null;

try {
  RNMasteryGame = require('./RNMasteryGame').default;
} catch (err) {
  importError = err;
  console.error('Import error:', err);
}

/**
 * Main App Component - TEMP: Hub disabled, direct to game
 */
function App() {
  const [userName, setUserName] = useState('Student');

  // Show import error immediately
  if (importError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'red',
        color: 'white',
        padding: '20px',
        fontSize: '18px',
        fontFamily: 'monospace'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>❌ IMPORT ERROR</h1>
        <p style={{ marginBottom: '10px' }}>Message: {importError.message}</p>
        <p style={{ marginBottom: '10px' }}>Stack: {importError.stack}</p>
        <hr style={{ margin: '20px 0' }} />
        <p>The app failed to load its components. Check the build process.</p>
      </div>
    );
  }

  // Load game directly without hub
  return <RNMasteryGame onBackToHub={() => {}} initialMode="study" />;
}

export default App;
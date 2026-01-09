import React, { useState } from 'react';
import RNMasteryGame from './RNMasteryGame';
import GameHub from './components/GameHub';
import FlashcardMode from './components/FlashcardMode';
import ClinicalRoundsApp from './components/ClinicalRoundsApp';
import './index.css';

/**
 * Main App Component - Hub System
 * Routes between hub and game views
 */
function App() {
  const [currentView, setCurrentView] = useState('hub');
  const [selectedGame, setSelectedGame] = useState(null);
  const [userName, setUserName] = useState('Student');
  const [error, setError] = useState(null);

  const handleSelectGame = (game) => {
    try {
      console.log('Selected game:', game);
      setSelectedGame(game);
      setCurrentView('game');
    } catch (err) {
      console.error('Error selecting game:', err);
      setError(err.message);
    }
  };

  const handleBackToHub = () => {
    try {
      setCurrentView('hub');
      setSelectedGame(null);
    } catch (err) {
      console.error('Error returning to hub:', err);
      setError(err.message);
    }
  };

  const handleSettings = () => {
    alert('Settings coming soon!');
  };

  // Error boundary
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#991b1b',
        color: 'white',
        padding: '40px',
        textAlign: 'center',
        fontFamily: 'system-ui'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>⚠️ Error</h1>
        <p style={{ marginBottom: '20px', fontSize: '18px' }}>{error}</p>
        <button 
          onClick={() => { setError(null); setCurrentView('hub'); }}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: 'white',
            color: '#991b1b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Return to Hub
        </button>
      </div>
    );
  }

  // Render hub or game
  if (currentView === 'hub') {
    return (
      <GameHub 
        onSelectGame={handleSelectGame}
        onSettings={handleSettings}
        userName={userName}
      />
    );
  }

  // Route to appropriate game component
  if (selectedGame?.id === 'flashcards') {
    return <FlashcardMode onBackToHub={handleBackToHub} />;
  }

  if (selectedGame?.id === 'clinical-rounds') {
    return <ClinicalRoundsApp onBackToHub={handleBackToHub} />;
  }

  // Default to RN Mastery Game
  return (
    <RNMasteryGame 
      onBackToHub={handleBackToHub}
      initialMode={selectedGame?.modes?.[0] || 'study'}
    />
  );
}

export default App;
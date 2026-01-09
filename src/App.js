import React, { useState } from 'react';
import RNMasteryGame from './RNMasteryGame';
import GameHub from './components/GameHub';
import './index.css';

/**
 * Main App Component - Hub System
 * 
 * Routes between different games/modes based on user selection.
 * Add new games by editing src/config/gamesRegistry.js
 */
function App() {
  const [currentView, setCurrentView] = useState('hub'); // 'hub' or game id
  const [selectedGame, setSelectedGame] = useState(null);
  const [userName, setUserName] = useState('Student');
  const [error, setError] = useState(null);

  const handleSelectGame = (game) => {
    try {
      console.log('Selected game:', game);
      setSelectedGame(game);
      setCurrentView(game.id);
    } catch (err) {
      console.error('Error selecting game:', err);
      setError(err.message);
    }
  };

  const handleBackToHub = () => {
    try {
      setCurrentView('hub');
      setSelectedGame(null);
      setError(null);
    } catch (err) {
      console.error('Error returning to hub:', err);
      setError(err.message);
    }
  };

  const handleSettings = () => {
    // TODO: Implement settings modal
    alert('Settings coming soon!');
  };

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-6">
        <div className="max-w-2xl bg-red-800 p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">⚠️ Error</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => { setError(null); setCurrentView('hub'); }}
            className="px-6 py-3 bg-white text-red-900 rounded-lg hover:bg-gray-100"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  // Render current view
  const renderView = () => {
    try {
      console.log('Rendering view:', currentView);
      
      switch (currentView) {
        case 'hub':
          return (
            <GameHub 
              onSelectGame={handleSelectGame}
              onSettings={handleSettings}
              userName={userName}
            />
          );
        
        case 'rn-mastery':
        case 'day-to-be-wrong':
          return <RNMasteryGame onBackToHub={handleBackToHub} />;
        
        case 'challenge-mode':
          return <RNMasteryGame onBackToHub={handleBackToHub} initialMode="challenge" />;
        
        case 'instructor-mode':
          return <RNMasteryGame onBackToHub={handleBackToHub} initialMode="instructor" />;
        
        default:
          return <RNMasteryGame onBackToHub={handleBackToHub} />;
      }
    } catch (err) {
      console.error('Error rendering view:', err);
      setError(err.message);
      return null;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import RNMasteryGame from './RNMasteryGame';
import GameHub from './components/GameHub';
import './index.css';

/**
 * Main App Component - Hub System
 * 
 * Routes between different games/modes based on user selection.
 * Add new games by editing data/games-registry.json
 */
function App() {
  const [currentView, setCurrentView] = useState('hub'); // 'hub' or game id
  const [selectedGame, setSelectedGame] = useState(null);
  const [userName, setUserName] = useState('Student');

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setCurrentView(game.id);
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    setSelectedGame(null);
  };

  const handleSettings = () => {
    // TODO: Implement settings modal
    alert('Settings coming soon!');
  };

  // Render current view
  const renderView = () => {
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
      
      // Add more game components here as you create them
      case 'challenge-mode':
        return <RNMasteryGame onBackToHub={handleBackToHub} initialMode="challenge" />;
      
      case 'instructor-mode':
        return <RNMasteryGame onBackToHub={handleBackToHub} initialMode="instructor" />;
      
      default:
        return (
          <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
              <button 
                onClick={handleBackToHub}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Back to Hub
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;
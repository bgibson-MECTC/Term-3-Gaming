import React, { useState, useEffect } from 'react';
import { Home, Settings, User, LogOut } from 'lucide-react';
import { getCategories } from '../utils/gameRegistry';
import { getChapterMetadata } from '../utils/chapterManager';

/**
 * Game Hub - Central Navigation
 * 
 * Acts as a launcher for all games and modes.
 * Games are loaded from games-registry.json
 */
export default function GameHub({ onSelectGame, onSettings, userName }) {
  const [categories, setCategories] = useState([]);
  const [chapterCount, setChapterCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadHub();
  }, []);

  const loadHub = async () => {
    const cats = getCategories();
    setCategories(cats);
    
    const chapters = getChapterMetadata();
    setChapterCount(chapters.length);
  };

  const handleGameSelect = (game) => {
    onSelectGame(game);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Nursing Education Hub</h1>
              <p className="text-sm text-white/70">Choose your learning path</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white/70">Chapters Available</p>
              <p className="text-2xl font-bold">{chapterCount}</p>
            </div>
            {userName && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <User className="w-5 h-5" />
                <span>{userName}</span>
              </div>
            )}
            <button 
              onClick={onSettings}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-white text-purple-900'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            All Games
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-white text-purple-900'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <cat.IconComponent className="w-4 h-4" />
              {cat.title}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {categories
          .filter(cat => !selectedCategory || cat.id === selectedCategory)
          .map(category => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <category.IconComponent className="w-8 h-8" />
                <div>
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                  <p className="text-white/70">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.games.map(game => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className={`bg-gradient-to-br ${game.color} p-6 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 text-left relative overflow-hidden group`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <game.IconComponent className="w-12 h-12" />
                        {game.specialMode && (
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                            SPECIAL
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
                      <p className="text-white/90 mb-4">{game.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {game.modes.map(mode => (
                          <span 
                            key={mode}
                            className="px-3 py-1 bg-black/20 rounded-full text-sm font-semibold"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>

                      {game.supportsDynamicChapters && (
                        <div className="mt-4 text-sm text-white/80 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Supports all {chapterCount} chapters
                        </div>
                      )}
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-white/50">Loading games...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/50">
          <p>🎓 Nursing Education Platform</p>
          <p className="text-sm mt-2">Add new games and chapters without coding - just edit JSON files!</p>
        </div>
      </div>
    </div>
  );
}

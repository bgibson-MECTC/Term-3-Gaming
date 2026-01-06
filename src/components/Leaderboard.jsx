import React from 'react';
import { Sword } from 'lucide-react';

const Leaderboard = ({ 
  scores, 
  user, 
  filter, 
  chapters,
  onFilterChange, 
  onBack 
}) => {
  const filteredScores = filter === 'all' 
    ? scores 
    : scores.filter(s => s.chapterTitle === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black">Class Leaderboard 🏆</h2>
          <button onClick={onBack} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">Back</button>
        </div>
        
        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button 
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-full text-sm transition ${filter === 'all' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
          >
            All Chapters
          </button>
          {chapters.map(ch => (
            <button 
              key={ch.id}
              onClick={() => onFilterChange(ch.title)}
              className={`px-3 py-1 rounded-full text-sm transition ${filter === ch.title ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              {ch.title.replace('Ch ', '')}
            </button>
          ))}
        </div>
        
        {/* Current Champion */}
        {filteredScores.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 flex items-center animate-pulse">
            <Sword className="w-6 h-6 text-yellow-400 mr-3" />
            <div>
              <div className="text-xs uppercase tracking-widest text-yellow-400 font-bold">Current Champion to Beat</div>
              <div className="text-xl font-bold text-white">{filteredScores[0].playerName} — {filteredScores[0].score} pts</div>
            </div>
          </div>
        )}

        {/* Scores List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredScores.map((entry, idx) => {
            const isCurrentUser = user && entry.uid === user.uid;
            return (
              <div key={entry.id} className={`flex items-center p-4 rounded-xl border transition ${isCurrentUser ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                <div className="w-10 font-black text-2xl text-slate-500 italic">#{idx + 1}</div>
                <div className="flex-1">
                  <div className={`font-bold text-lg ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                    {entry.playerName} {isCurrentUser && '(You)'}
                  </div>
                  <div className="text-xs text-slate-400">{entry.chapterTitle}</div>
                </div>
                <div className="font-mono text-xl text-cyan-400 font-bold">{entry.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

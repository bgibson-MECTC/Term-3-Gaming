import React from 'react';
import { Trophy, Star, Loader2 } from 'lucide-react';

const Summary = ({ 
  score, 
  correctCount, 
  incorrectCount,
  totalQuestions,
  chapterTitle,
  personalBest,
  rank,
  playerName,
  isSubmitting,
  onPlayerNameChange,
  onSaveScore,
  onReturnToMenu 
}) => {
  const isNewRecord = score > personalBest;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/50 animate-bounce">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">MODULE COMPLETE!</h2>
        <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-cyan-300 font-bold text-sm mb-4">{chapterTitle}</div>

        {isNewRecord && (
          <div className="mb-4 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/50 text-yellow-300 font-bold animate-pulse">
            🎉 NEW PERSONAL BEST! 🎉
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <div className="text-3xl font-black text-cyan-400">{score}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Score</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <div className="text-3xl font-black text-green-400">{percentage}%</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Accuracy</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <div className="text-lg font-bold text-yellow-400 flex items-center justify-center"><Star className="w-4 h-4 mr-1" />{rank.split(' ')[0]}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Rank</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{correctCount}</div>
            <div className="text-xs text-green-300">Correct</div>
          </div>
          <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{incorrectCount}</div>
            <div className="text-xs text-red-300">Incorrect</div>
          </div>
          <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">{personalBest}</div>
            <div className="text-xs text-purple-300">Prev Best</div>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
          <h3 className="text-white font-bold mb-4">Submit to Leaderboard</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={playerName}
              onChange={onPlayerNameChange}
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
            />
            <button 
              onClick={onSaveScore}
              disabled={!playerName.trim() || isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-6 transition disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>

        <button onClick={onReturnToMenu} className="text-slate-400 hover:text-white transition">Skip & Return to Menu</button>
      </div>
    </div>
  );
};

export default Summary;

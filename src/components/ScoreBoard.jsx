import React from 'react';
import { Flame } from 'lucide-react';

const ScoreBoard = ({ score, streak, getMultiplier }) => {
  return (
    <div className="flex items-center gap-4">
      {streak > 2 && (
        <div className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-full text-sm font-bold flex items-center animate-bounce">
          <Flame className="w-4 h-4 mr-1" /> {streak}x Streak ({getMultiplier()}x Multiplier)
        </div>
      )}
      <div className="font-mono text-2xl font-black text-cyan-400">{score}</div>
    </div>
  );
};

export default ScoreBoard;

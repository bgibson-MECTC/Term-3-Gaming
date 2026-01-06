import React from 'react';
import { Trophy } from 'lucide-react';

const ChapterSelector = ({ chapters, onSelectChapter, onViewLeaderboard }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
            RN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">MASTERY</span>
          </h1>
          <p className="text-xl text-slate-400">Classroom Competitive Edition v2.0</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chapter List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-slate-400 font-bold mb-4 uppercase text-sm tracking-wider">Select Module</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {chapters.map(ch => (
                <button 
                  key={ch.id} 
                  onClick={() => onSelectChapter(ch)} 
                  className="w-full p-4 bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/50 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-white/10 rounded-lg mr-4 text-white group-hover:text-cyan-300">{ch.icon}</div>
                    <div>
                      <div className="font-bold text-white group-hover:text-cyan-300">{ch.title}</div>
                      <div className="text-xs text-slate-400">{ch.questions.length} Questions</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Teaser */}
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col justify-center items-center text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mb-6 drop-shadow-glow" />
            <h2 className="text-2xl font-bold text-white mb-2">Class Leaderboard</h2>
            <p className="text-slate-300 mb-8">Compete with your classmates for the top spot!</p>
            <button 
              onClick={onViewLeaderboard} 
              className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-transform"
            >
              View Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterSelector;

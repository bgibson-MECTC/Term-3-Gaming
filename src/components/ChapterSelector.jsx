import React from 'react';
import { Trophy, Target, CheckCircle } from 'lucide-react';

const ChapterSelector = ({ chapters, onSelectChapter, onViewLeaderboard, onPracticeModes, submittedChapters = [] }) => {
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
              {chapters.map(ch => {
                const isCompleted = submittedChapters.includes(ch.title);
                return (
                  <button 
                    key={ch.id} 
                    onClick={() => onSelectChapter(ch)} 
                    className="w-full p-4 bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/50 rounded-xl text-left transition-all group relative"
                  >
                    {isCompleted && (
                      <div className="absolute top-2 right-2 bg-green-500/20 border border-green-500/50 rounded-full px-2 py-1 flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                        <span className="text-xs text-green-300 font-bold">Ranked</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="p-2 bg-white/10 rounded-lg mr-4 text-white group-hover:text-cyan-300">{ch.icon}</div>
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-300">{ch.title}</div>
                        <div className="text-xs text-slate-400">{ch.questions.length} Questions</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Teaser */}
          <div className="space-y-4">
            {/* Practice Modes */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center">
              <Target className="w-12 h-12 text-pink-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Practice Modes</h2>
              <p className="text-slate-300 text-sm mb-6">Exam Traps, Priority, Labs & More!</p>
              <button 
                onClick={onPracticeModes} 
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                🎯 PRACTICE MODES
              </button>
            </div>

            {/* Leaderboard */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Leaderboard</h2>
              <p className="text-slate-300 text-sm mb-6">Compete with your classmates!</p>
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
    </div>
  );
};

export default ChapterSelector;

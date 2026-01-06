import React from 'react';
import { Shield, AlertCircle, Target, Beaker, ListOrdered, Lock, RotateCcw, Crown } from 'lucide-react';
import { MODES, MODE_INFO } from '../modes';

const MODE_ICONS = {
  [MODES.CHAPTER_REVIEW]: Shield,
  [MODES.EXAM_TRAPS]: AlertCircle,
  [MODES.PRIORITY_FIRST]: Target,
  [MODES.LABS_DIAGNOSTICS]: Beaker,
  [MODES.SEQUENCING]: ListOrdered,
  [MODES.BARRIER_BOOTCAMP]: Lock,
  [MODES.MISSED_REMATCH]: RotateCcw,
  [MODES.BOSS_FIGHT]: Crown,
};

export default function ModeSelector({ chapters, onSelectMode, onBack, analytics }) {
  // Group modes
  const globalModes = [
    MODES.EXAM_TRAPS,
    MODES.PRIORITY_FIRST,
    MODES.LABS_DIAGNOSTICS,
    MODES.SEQUENCING,
    MODES.BARRIER_BOOTCAMP,
    MODES.BOSS_FIGHT,
  ];

  const specialModes = [MODES.MISSED_REMATCH];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white font-sans p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="text-slate-400 hover:text-white transition"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-black">Choose Your Mode</h1>
          <div className="w-20"></div>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Your Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400">{analytics.totalAttempts}</div>
                <div className="text-sm text-slate-400">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400">
                  {analytics.totalAttempts > 0 
                    ? Math.round((analytics.correctCount / analytics.totalAttempts) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-slate-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{analytics.missedCount}</div>
                <div className="text-sm text-slate-400">Missed Questions</div>
              </div>
            </div>
            {analytics.confidenceStats && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Confident & Correct:</span>
                    <span className="ml-2 font-bold text-green-400">
                      {analytics.confidenceStats.sureCorrect || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Confident but Wrong:</span>
                    <span className="ml-2 font-bold text-red-400">
                      {analytics.confidenceStats.sureWrong || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Lucky Guess:</span>
                    <span className="ml-2 font-bold text-yellow-400">
                      {analytics.confidenceStats.guessCorrect || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Guess & Wrong:</span>
                    <span className="ml-2 font-bold text-orange-400">
                      {analytics.confidenceStats.guessWrong || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Modes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🌍 Global Modes (All Chapters)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalModes.map(mode => {
              const info = MODE_INFO[mode];
              const Icon = MODE_ICONS[mode];
              return (
                <button
                  key={mode}
                  onClick={() => onSelectMode(mode, null)}
                  className={`bg-gradient-to-br ${info.color} p-6 rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all hover:scale-105 text-left shadow-xl`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{info.icon}</div>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{info.title}</h3>
                  <p className="text-white/80 text-sm">{info.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Modes */}
        {specialModes.length > 0 && analytics?.missedCount > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🎯 Special Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialModes.map(mode => {
                const info = MODE_INFO[mode];
                const Icon = MODE_ICONS[mode];
                return (
                  <button
                    key={mode}
                    onClick={() => onSelectMode(mode, null)}
                    className={`bg-gradient-to-br ${info.color} p-6 rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all hover:scale-105 text-left shadow-xl`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{info.icon}</div>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-2">{info.title}</h3>
                    <p className="text-white/80 text-sm">{info.description}</p>
                    <div className="mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold inline-block">
                      {analytics.missedCount} questions available
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chapter Review */}
        <div>
          <h2 className="text-2xl font-bold mb-4">📚 Chapter Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map(chapter => (
              <button
                key={chapter.id}
                onClick={() => onSelectMode(MODES.CHAPTER_REVIEW, chapter.id)}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all hover:scale-105 text-left shadow-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{chapter.icon}</div>
                </div>
                <h3 className="text-xl font-black mb-2">{chapter.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{chapter.description}</p>
                <div className="text-xs text-slate-500">
                  {chapter.questions.length} questions
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

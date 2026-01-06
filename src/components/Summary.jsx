import React, { useState } from 'react';
import { Trophy, Star, Loader2, XCircle, CheckCircle, ChevronDown, ChevronUp, Download, Lock } from 'lucide-react';

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
  missedQuestions = [],
  onPlayerNameChange,
  onSaveScore,
  onReturnToMenu,
  hasSubmitted = false,
  aiExplanation = null
}) => {
  const isNewRecord = score > personalBest;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const [showMissed, setShowMissed] = useState(false);

  // Download AI Study Guide function
  const downloadStudyGuide = () => {
    if (!aiExplanation) return;
    
    const content = `AI STUDY GUIDE - ${chapterTitle}
Generated: ${new Date().toLocaleString()}

==============================================
CHAPTER SUMMARY
==============================================
${chapterTitle}
Score: ${score} | Accuracy: ${percentage}%
Rank: ${rank}
Questions Correct: ${correctCount}/${totalQuestions}

==============================================
AI-GENERATED STUDY NOTES
==============================================

${aiExplanation}

==============================================
MISSED QUESTIONS REVIEW
==============================================

${missedQuestions.length > 0 ? missedQuestions.map((missed, idx) => `
Question ${missed.questionNumber}:
${missed.question.text}

Your Answer: ${missed.question.options[missed.selectedAnswer]}
Correct Answer: ${missed.question.options[missed.question.correctIndex]}

Rationale: ${missed.question.rationale}

---
`).join('\n') : 'No missed questions - Perfect score!'}

==============================================
Study Tips:
- Review missed questions daily
- Use mnemonics to remember key concepts
- Connect concepts to clinical cases
- Practice with different question formats
==============================================
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapterTitle.replace(/\s+/g, '_')}_Study_Guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
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

        {/* Missed Questions Review */}
        {missedQuestions.length > 0 && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowMissed(!showMissed)}
              className="w-full p-4 flex items-center justify-between hover:bg-red-500/20 transition"
            >
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-400 mr-3" />
                <span className="font-bold text-white">Review Missed Questions ({missedQuestions.length})</span>
              </div>
              {showMissed ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
            </button>
            
            {showMissed && (
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto text-left">
                {missedQuestions.map((missed, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-red-500/20">
                    <div className="font-bold text-red-300 mb-2">Question {missed.questionNumber}</div>
                    <div className="text-white mb-3">{missed.question.text}</div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-red-300 font-bold">Your Answer: </span>
                          <span className="text-slate-300">{missed.question.options[missed.selectedAnswer]}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-green-300 font-bold">Correct Answer: </span>
                          <span className="text-slate-300">{missed.question.options[missed.question.correctIndex]}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="text-blue-300 font-bold text-xs uppercase mb-1">Rationale:</div>
                        <div className="text-slate-300">{missed.question.rationale}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Download AI Study Guide */}
        {aiExplanation && (
          <div className="mb-6">
            <button
              onClick={downloadStudyGuide}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-2xl transition flex items-center justify-center shadow-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              💾 Download AI Study Guide
            </button>
            <p className="text-slate-400 text-xs text-center mt-2">Save this AI-generated study guide for finals!</p>
          </div>
        )}

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
          <h3 className="text-white font-bold mb-2 flex items-center justify-between">
            <span>Submit to Leaderboard</span>
            {hasSubmitted && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/30">
                ✓ Already Submitted
              </span>
            )}
          </h3>
          {hasSubmitted && (
            <p className="text-sm text-slate-400 mb-4">
              🔒 <strong>Ranked Mode:</strong> You've already submitted a score for this chapter. You can still practice, but can't overwrite your ranked score.
            </p>
          )}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={playerName}
              onChange={onPlayerNameChange}
              disabled={hasSubmitted}
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={onSaveScore}
              disabled={!playerName.trim() || isSubmitting || hasSubmitted}
              className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-6 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {hasSubmitted ? (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  Locked
                </>
              ) : isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>

        <button onClick={onReturnToMenu} className="text-slate-400 hover:text-white transition">Return to Menu</button>
      </div>
    </div>
  );
};

export default Summary;

import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, Play } from 'lucide-react';

/**
 * Instructor Judge Panel Component
 * Displays challenge details and allows instructor to make judgment decisions
 */
export default function InstructorJudgePanel({ gameState, onJudge, onReveal }) {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [judgeNote, setJudgeNote] = useState('');

  if (!gameState) return null;

  const { phase, currentScenario, teams, submissions, challenges, judgeDecision } = gameState;

  // Only show panel in JUDGE phase
  if (phase !== 'JUDGE') return null;

  const handleJudgment = (type, challengerTeamId = null, targetTeamId = null) => {
    onJudge({
      type,
      challengerTeamId,
      targetTeamId,
      note: judgeNote
    });
    setJudgeNote('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-purple-900/30 border-b border-purple-500 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-black text-white">Judge Panel</h2>
          </div>
          <p className="text-slate-300">Review submissions and challenges to make your judgment</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Question Display */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">Current Question</h3>
            <div className="text-slate-300 mb-4">{currentScenario?.prompt}</div>
            <div className="grid gap-2">
              {currentScenario?.choices?.map((choice, idx) => (
                <div key={idx} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-200">
                  <span className="font-bold text-cyan-400">Option {idx + 1}:</span> {choice}
                </div>
              ))}
            </div>
          </div>

          {/* Team Submissions */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Team Submissions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {teams.map((team) => {
                const submission = submissions[team.id];
                return (
                  <div key={team.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{team.name}</span>
                      <span className="text-sm text-slate-400">Score: {team.score}</span>
                    </div>
                    {submission ? (
                      <div className="bg-cyan-500/20 border border-cyan-500 rounded-lg p-2 text-cyan-300 text-sm">
                        Submitted: Option {submission.choiceIndex + 1}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm italic">No submission</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Challenges */}
          {challenges.length > 0 ? (
            <div className="bg-slate-800 border border-red-500 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Challenges Submitted ({challenges.length})
              </h3>
              <div className="space-y-4">
                {challenges.map((challenge, idx) => {
                  const challenger = teams.find(t => t.id === challenge.challengerTeamId);
                  const target = teams.find(t => t.id === challenge.targetTeamId);
                  const isSelected = selectedChallenge === idx;

                  return (
                    <div
                      key={idx}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedChallenge(isSelected ? null : idx)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-orange-400">{challenger?.name}</span>
                          <span className="text-slate-400">→ challenges →</span>
                          <span className="font-bold text-purple-400">{target?.name}</span>
                        </div>
                        {isSelected && <Eye className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 mb-2">
                        <div className="text-xs text-slate-400 mb-1">Trap Explanation:</div>
                        <div className="text-slate-200 text-sm">{challenge.trapText}</div>
                      </div>
                      <div className="text-sm text-cyan-400">
                        Alternative Proposed: Option {challenge.alternativeIndex + 1}
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-600 flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJudgment('CHALLENGE_SUCCESS', challenge.challengerTeamId, challenge.targetTeamId);
                            }}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Accept Challenge
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJudgment('CHALLENGE_FAIL', challenge.challengerTeamId, challenge.targetTeamId);
                            }}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject Challenge
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
              <p className="text-slate-400">No challenges submitted</p>
            </div>
          )}

          {/* Judge Notes */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Judge Notes (Optional)</h3>
            <textarea
              value={judgeNote}
              onChange={(e) => setJudgeNote(e.target.value)}
              placeholder="Add notes about your decision..."
              className="w-full h-24 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Judge Decision Display */}
          {judgeDecision && (
            <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-green-400">Judgment Recorded</h3>
              </div>
              <div className="text-slate-200">
                <div className="mb-2">
                  <span className="font-bold">Decision:</span> {judgeDecision.type.replace(/_/g, ' ')}
                </div>
                {judgeDecision.note && (
                  <div className="bg-slate-800 rounded-lg p-3 mt-2">
                    <div className="text-xs text-slate-400 mb-1">Notes:</div>
                    <div className="text-sm">{judgeDecision.note}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!judgeDecision ? (
              <button
                onClick={() => handleJudgment('NO_CHALLENGE')}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition"
              >
                No Valid Challenges - Proceed to Score
              </button>
            ) : (
              <button
                onClick={onReveal}
                className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 animate-pulse"
              >
                <Play className="w-6 h-6" />
                Reveal Answer & Score Round
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

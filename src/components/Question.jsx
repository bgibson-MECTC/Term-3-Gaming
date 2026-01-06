import React from 'react';
import { CheckCircle, XCircle, ArrowRight, Sparkles, Loader2, Lightbulb } from 'lucide-react';

const Question = ({ 
  question, 
  selectedOption, 
  showRationale, 
  feedbackMessage,
  aiExplanation,
  isAiLoading,
  hiddenOptions = [],
  examTip = null,
  confidence = null,
  onSelectOption, 
  onAiTutor,
  onNextQuestion,
  onConfidenceSelect 
}) => {
  return (
    <>
      {/* Question Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold leading-relaxed mb-8 mt-2">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            // Check if this option is hidden by 50/50
            const isHidden = hiddenOptions.includes(idx);
            
            let style = "p-5 rounded-xl border-2 text-left font-medium transition-all duration-200 w-full flex items-center ";
            
            if (isHidden && !showRationale) {
              // Hidden by 50/50 - make it invisible but keep layout
              style += "opacity-0 pointer-events-none border-white/5";
            } else if (showRationale) {
              if (idx === question.correctIndex) style += "border-green-500 bg-green-500/20 text-green-100";
              else if (idx === selectedOption) style += "border-red-500 bg-red-500/20 text-red-100";
              else style += "border-white/5 opacity-50";
            } else {
              if (selectedOption === idx) style += "border-cyan-500 bg-cyan-500/20 text-cyan-100";
              else style += "border-white/10 hover:bg-white/5 hover:border-white/30";
            }
            
            return (
              <button 
                key={idx} 
                onClick={() => !showRationale && !isHidden && onSelectOption(idx)} 
                className={style}
                disabled={isHidden && !showRationale}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 text-sm font-bold">{idx + 1}</div>
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rationale Section */}
      {showRationale && (
        <div className="animate-in slide-in-from-bottom duration-300">
          {/* Confidence Selector (shown only if not already selected) */}
          {!confidence && onConfidenceSelect && (
            <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-sm text-slate-300 mb-3">How confident were you with this answer?</div>
              <div className="flex gap-3">
                <button 
                  onClick={() => onConfidenceSelect('SURE')}
                  className="flex-1 py-3 px-4 bg-green-500/20 border-2 border-green-500/30 rounded-xl hover:bg-green-500/30 transition font-bold text-green-300"
                >
                  ✓ Sure
                </button>
                <button 
                  onClick={() => onConfidenceSelect('GUESS')}
                  className="flex-1 py-3 px-4 bg-yellow-500/20 border-2 border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition font-bold text-yellow-300"
                >
                  ? Guess
                </button>
              </div>
            </div>
          )}

          <div className={`p-6 rounded-2xl mb-4 border ${selectedOption === question.correctIndex ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="font-bold text-lg mb-2 flex items-center">
              {selectedOption === question.correctIndex ? <CheckCircle className="mr-2 text-green-400" /> : <XCircle className="mr-2 text-red-400" />}
              {feedbackMessage}
            </div>
            <p className="text-slate-300 leading-relaxed">{question.rationale}</p>
            
            {/* Exam Tip */}
            {examTip && (
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-cyan-200">{examTip}</div>
                </div>
              </div>
            )}
            
            {/* AI Section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              {!aiExplanation ? (
                <button onClick={onAiTutor} disabled={isAiLoading} className="text-sm text-purple-300 hover:text-purple-200 flex items-center">
                  {isAiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Fun Mnemonic
                </button>
              ) : (
                <div className="text-sm text-purple-200 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 mt-2">
                  <Sparkles className="w-4 h-4 inline mr-2" /> {aiExplanation}
                </div>
              )}
            </div>
          </div>
          <button onClick={onNextQuestion} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center">
            NEXT <ArrowRight className="ml-2" />
          </button>
        </div>
      )}
    </>
  );
};

export default Question;

import React from 'react';
import { CheckCircle, XCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const Question = ({ 
  question, 
  selectedOption, 
  showRationale, 
  feedbackMessage,
  aiExplanation,
  isAiLoading,
  onSelectOption, 
  onAiTutor,
  onNextQuestion 
}) => {
  return (
    <>
      {/* Question Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold leading-relaxed mb-8 mt-2">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let style = "p-5 rounded-xl border-2 text-left font-medium transition-all duration-200 w-full flex items-center ";
            if (showRationale) {
              if (idx === question.correctIndex) style += "border-green-500 bg-green-500/20 text-green-100";
              else if (idx === selectedOption) style += "border-red-500 bg-red-500/20 text-red-100";
              else style += "border-white/5 opacity-50";
            } else {
              if (selectedOption === idx) style += "border-cyan-500 bg-cyan-500/20 text-cyan-100";
              else style += "border-white/10 hover:bg-white/5 hover:border-white/30";
            }
            return (
              <button key={idx} onClick={() => !showRationale && onSelectOption(idx)} className={style}>
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
          <div className={`p-6 rounded-2xl mb-4 border ${selectedOption === question.correctIndex ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="font-bold text-lg mb-2 flex items-center">
              {selectedOption === question.correctIndex ? <CheckCircle className="mr-2 text-green-400" /> : <XCircle className="mr-2 text-red-400" />}
              {feedbackMessage}
            </div>
            <p className="text-slate-300 leading-relaxed">{question.rationale}</p>
            
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

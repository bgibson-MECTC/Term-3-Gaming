// INTEGRATION GUIDE: Add these pieces to RNMasteryGame.jsx
// This shows EXACTLY what to add to connect the tag overlay & modes system

// ============================================
// 1. UPDATE IMPORTS (lines 1-20)
// ============================================
// REMOVE THIS:
// import { enrichQuestions, getPool, updateWeaknessStats, getWeaknessPool } from './questionTags';

// REPLACE WITH THIS:
import { enrichQuestions, getExamTip } from './questionTags/index';
import { MODES, getPool, MODE_INFO } from './modes';
import ModeSelector from './components/ModeSelector';

// ============================================
// 2. ADD NEW STATE VARIABLES (after line 1445)
// ============================================
// Add these to your existing useState declarations:

const [currentMode, setCurrentMode] = useState(MODES.CHAPTER_REVIEW);
const [confidence, setConfidence] = useState(null);
const [analytics, setAnalytics] = useState(() => {
  const saved = localStorage.getItem('rnMasteryAnalytics');
  return saved ? JSON.parse(saved) : {
    totalAttempts: 0,
    correctCount: 0,
    missedCount: 0,
    confidenceStats: {
      sureCorrect: 0,
      sureWrong: 0,
      guessCorrect: 0,
      guessWrong: 0
    }
  };
});

// ============================================
// 3. ADD MODE STARTER FUNCTION (after startChapter)
// ============================================

const startMode = (mode, chapterId) => {
  // Get all questions from all chapters and enrich with tags
  const allQuestions = INITIAL_DATA.flatMap(ch => 
    enrichQuestions(ch.questions)
  );
  
  // Get filtered pool based on selected mode
  const missedIds = missedQuestions.map(mq => mq.question.id);
  const pool = getPool(allQuestions, mode, { chapterId, missedIds });
  
  if (pool.length === 0) {
    alert('No questions available for this mode!');
    return;
  }
  
  // Create virtual chapter with filtered questions
  const modeChapter = {
    id: chapterId || mode,
    title: MODE_INFO[mode].title,
    icon: MODE_INFO[mode].icon,
    description: MODE_INFO[mode].description,
    questions: shuffleArray(pool)
  };
  
  setActiveChapter(modeChapter);
  setCurrentMode(mode);
  setCurrentQuestionIndex(0);
  setScore(0);
  setStreak(0);
  setCorrectCount(0);
  setIncorrectCount(0);
  setMissedQuestions([]);
  setFiftyFiftyUsed(false);
  setHiddenOptions([]);
  setConfidence(null);
  setGameState('playing');
  setSelectedOption(null);
  setShowRationale(false);
  setAiExplanation(null);
  setFeedbackMessage('');
  setRiskMode(false);
};

// ============================================
// 4. ADD CONFIDENCE HANDLER (after submitAnswer)
// ============================================

const handleConfidenceSelect = (conf) => {
  setConfidence(conf);
  
  const currentQuestion = activeChapter.questions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQuestion.correctIndex;
  
  // Determine which confidence category
  const key = conf === 'SURE' 
    ? (isCorrect ? 'sureCorrect' : 'sureWrong')
    : (isCorrect ? 'guessCorrect' : 'guessWrong');
  
  // Update analytics
  const newAnalytics = {
    ...analytics,
    totalAttempts: analytics.totalAttempts + 1,
    correctCount: isCorrect ? analytics.correctCount + 1 : analytics.correctCount,
    missedCount: isCorrect ? analytics.missedCount : analytics.missedCount + 1,
    confidenceStats: {
      ...analytics.confidenceStats,
      [key]: analytics.confidenceStats[key] + 1
    }
  };
  
  setAnalytics(newAnalytics);
  localStorage.setItem('rnMasteryAnalytics', JSON.stringify(newAnalytics));
};

// ============================================
// 5. UPDATE GameScreen (around line 1520)
// ============================================

const GameScreen = () => {
  const q = activeChapter.questions[currentQuestionIndex];
  const examTip = getExamTip(q); // Generate exam tip
  
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
      {/* ...existing code... */}
      
      <Question 
        question={q}
        selectedOption={selectedOption}
        showRationale={showRationale}
        feedbackMessage={feedbackMessage}
        aiExplanation={aiExplanation}
        isAiLoading={isAiLoading}
        hiddenOptions={hiddenOptions}
        examTip={examTip}  // ADD THIS
        confidence={confidence}  // ADD THIS
        onSelectOption={setSelectedOption}
        onAiTutor={handleAiTutor}
        onNextQuestion={nextQuestion}
        onConfidenceSelect={handleConfidenceSelect}  // ADD THIS
      />
      
      {/* ...rest of code... */}
    </div>
  );
};

// ============================================
// 6. ADD MODE SELECTOR SCREEN (before main render)
// ============================================

const ModeSelectScreen = () => {
  return (
    <ModeSelector
      chapters={INITIAL_DATA}
      analytics={analytics}
      onSelectMode={startMode}
      onBack={() => setGameState('menu')}
    />
  );
};

// ============================================
// 7. UPDATE MAIN RENDER (bottom of component)
// ============================================

// Add this case to your game state handler:
if (gameState === 'modeSelector') return <ModeSelectScreen />;

// ============================================
// 8. ADD BUTTON TO ChapterSelector (src/components/ChapterSelector.jsx)
// ============================================

// Add this button near the leaderboard button:
<button
  onClick={() => setGameState('modeSelector')}
  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black text-lg hover:scale-105 transition-all shadow-lg"
>
  🎯 PRACTICE MODES
</button>

// ============================================
// 9. UPDATE WEAKNESS TRACKING (in submitAnswer)
// ============================================

// FIND THIS CODE (around line 1500):
if (isCorrect) {
  // ...existing code...
} else {
  setIncorrectCount(incorrectCount + 1);
  setStreak(0);
  
  // Track missed question for review
  setMissedQuestions([...missedQuestions, {
    question: currentQuestion,
    selectedAnswer: selectedOption,
    questionNumber: currentQuestionIndex + 1
  }]);
  
  // REPLACE the old updateWeaknessStats call with this:
  if (currentQuestion.skill || currentQuestion.concept) {
    const newWeakness = { ...weaknessStats };
    
    // Track by skill
    if (Array.isArray(currentQuestion.skill)) {
      currentQuestion.skill.forEach(skill => {
        newWeakness.missedBySkill = newWeakness.missedBySkill || {};
        newWeakness.missedBySkill[skill] = (newWeakness.missedBySkill[skill] || 0) + 1;
      });
    }
    
    // Track by concept
    if (currentQuestion.concept) {
      newWeakness.missedByConcept = newWeakness.missedByConcept || {};
      newWeakness.missedByConcept[currentQuestion.concept] = 
        (newWeakness.missedByConcept[currentQuestion.concept] || 0) + 1;
    }
    
    // Track by Bloom level
    if (currentQuestion.bloom) {
      newWeakness.missedByBloom = newWeakness.missedByBloom || {};
      newWeakness.missedByBloom[currentQuestion.bloom] = 
        (newWeakness.missedByBloom[currentQuestion.bloom] || 0) + 1;
    }
    
    setWeaknessStats(newWeakness);
    localStorage.setItem('rnMasteryWeakness', JSON.stringify(newWeakness));
  }
  
  // ...rest of code...
}

// ============================================
// 10. DELETE OLD questionTags.js
// ============================================
// Run this command in terminal:
// rm src/questionTags.js

// ============================================
// THAT'S IT! System is integrated. 🎉
// ============================================

/* 
TESTING CHECKLIST:
1. ✓ Run game, no errors
2. ✓ Click "Practice Modes" button
3. ✓ Select "Exam Traps" mode
4. ✓ Answer question, see confidence buttons
5. ✓ See exam tip below rationale
6. ✓ Check analytics dashboard shows stats
7. ✓ Try Boss Fight mode (10 questions)
8. ✓ Try Missed Rematch (after missing some)
9. ✓ Verify all 8 modes work
10. ✓ Verify tags enriching correctly
*/

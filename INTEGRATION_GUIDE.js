/**
 * INTEGRATION EXAMPLE: How to add Mode Selector to your game
 * 
 * This file shows the minimal changes needed to enable the new tagging system
 */

// ============================================
// STEP 1: Add to imports in RNMasteryGame.jsx
// ============================================
import ModeSelector from './components/ModeSelector';
import { enrichQuestions, getPool, updateWeaknessStats, getWeaknessPool } from './questionTags';

// ============================================
// STEP 2: Add new state variables
// ============================================
const [selectedMode, setSelectedMode] = useState('CHAPTER_REVIEW');
const [weaknessStats, setWeaknessStats] = useState(() => {
  const saved = localStorage.getItem('rnMasteryWeakness');
  return saved ? JSON.parse(saved) : { missedBySkill: {}, missedByConcept: {}, missedByBloom: {} };
});

// ============================================
// STEP 3: Add mode selector screen
// ============================================
// In main render, add this before menu:
if (gameState === 'modeSelect') {
  return (
    <ModeSelector 
      chapters={INITIAL_DATA}
      weaknessStats={weaknessStats}
      onSelectMode={(mode, chapterId) => {
        setSelectedMode(mode);
        if (chapterId) {
          // Chapter-specific mode
          const chapter = INITIAL_DATA.find(c => c.id === chapterId);
          startChapter(chapter, mode);
        } else {
          // Global mode (all chapters)
          startGlobalMode(mode);
        }
      }}
    />
  );
}

// ============================================
// STEP 4: Add global mode function
// ============================================
const startGlobalMode = (mode) => {
  // Get all questions from all chapters
  const allQuestions = INITIAL_DATA.flatMap(chapter => 
    enrichQuestions(chapter.questions)
  );
  
  // Filter based on mode
  let pool;
  if (mode === 'WEAKNESS_BUILDER') {
    pool = getWeaknessPool(allQuestions, weaknessStats);
  } else {
    pool = getPool(allQuestions, mode);
  }
  
  // Shuffle and limit
  const shuffled = shuffleArray(pool).slice(0, 25);
  
  // Create virtual chapter
  const virtualChapter = {
    id: mode.toLowerCase(),
    title: getModeTitle(mode),
    icon: getModeIcon(mode),
    description: getModeDescription(mode),
    questions: shuffled
  };
  
  setActiveChapter(virtualChapter);
  setCurrentQuestionIndex(0);
  setScore(0);
  setStreak(0);
  setCorrectCount(0);
  setIncorrectCount(0);
  setMissedQuestions([]);
  setFiftyFiftyUsed(false);
  setHiddenOptions([]);
  setGameState('playing');
  setSelectedOption(null);
  setShowRationale(false);
  setAiExplanation(null);
  setFeedbackMessage('');
  setRiskMode(false);
};

const getModeTitle = (mode) => {
  const titles = {
    EXAM_TRAPS: '⚠️ Exam Traps Mode',
    PRIORITY_FIRST: '🎯 Priority Questions',
    LABS_DIAGNOSTICS: '🧪 Labs & Diagnostics',
    SEQUENCING: '📋 Sequencing',
    DIFFERENTIATION: '🔍 Compare & Contrast',
    MED_SAFETY: '💊 Medication Safety',
    TEACHING: '📚 Patient Teaching',
    WEAKNESS_BUILDER: '🧠 Weakness Builder'
  };
  return titles[mode] || mode;
};

const getModeIcon = (mode) => {
  return <Brain className="w-6 h-6" />; // Use appropriate icon
};

const getModeDescription = (mode) => {
  const descriptions = {
    EXAM_TRAPS: 'Common NCLEX pitfalls and mistakes',
    PRIORITY_FIRST: 'What should the nurse do first?',
    LABS_DIAGNOSTICS: 'Interpret lab values and results',
    SEQUENCING: 'Order of operations and procedures',
    DIFFERENTIATION: 'Compare and contrast conditions',
    MED_SAFETY: 'Medication errors and contraindications',
    TEACHING: 'Patient education scenarios',
    WEAKNESS_BUILDER: 'AI-powered weak area focus'
  };
  return descriptions[mode] || 'Mixed practice questions';
};

// ============================================
// STEP 5: Update menu to show mode selector
// ============================================
// In ChapterSelector component, add button:
<button 
  onClick={() => setGameState('modeSelect')}
  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:scale-105 transition"
>
  🎯 Practice Modes
</button>

// ============================================
// STEP 6: OPTIONAL - Show weakness stats in Summary
// ============================================
// In Summary screen, add after score display:
{weaknessStats && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mt-6">
    <h3 className="text-xl font-bold mb-4 text-red-300">📊 Your Weak Areas</h3>
    
    <div className="mb-4">
      <h4 className="font-bold text-sm text-red-200 mb-2">Skills to Practice:</h4>
      {Object.entries(weaknessStats.missedBySkill || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([skill, count]) => (
          <div key={skill} className="flex justify-between text-sm mb-1">
            <span>{skill.replace(/_/g, ' ')}</span>
            <span className="text-red-400">{count} missed</span>
          </div>
        ))}
    </div>

    <button 
      onClick={() => {
        setGameState('modeSelect');
      }}
      className="w-full mt-4 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition"
    >
      🧠 Practice Weak Areas
    </button>
  </div>
)}

// ============================================
// TESTING THE SYSTEM
// ============================================

// Test 1: Verify questions are enriched
console.log('Test enrichment:', enrichQuestions([{id: 'ch18_q01', text: 'test'}]));
// Should show: { id: 'ch18_q01', chapter: 'ch18', concept: 'FIRST_LINE_DEFENSE', ... }

// Test 2: Verify mode filtering
const testQuestions = enrichQuestions(INITIAL_DATA[0].questions);
console.log('Priority questions:', getPool(testQuestions, 'PRIORITY_FIRST').length);
console.log('Lab questions:', getPool(testQuestions, 'LABS_DIAGNOSTICS').length);

// Test 3: Verify weakness tracking
const testStats = updateWeaknessStats(
  { id: 'ch18_q01', concept: 'TEST', skill: ['PRIORITY'] }, 
  false, 
  {}
);
console.log('Weakness stats:', testStats);
// Should show: { missedBySkill: { PRIORITY: 1 }, missedByConcept: { TEST: 1 }, ... }

// ============================================
// QUICK WINS - WHAT TO DO FIRST
// ============================================

// 1. Add ModeSelector button to menu (5 minutes)
// 2. Test CHAPTER_REVIEW mode (should work immediately)
// 3. Test EXAM_TRAPS mode (shows MED_SAFETY + TEACHING_ERROR questions)
// 4. Play a few games and check localStorage for 'rnMasteryWeakness'
// 5. Test WEAKNESS_BUILDER mode (should prioritize your weak areas)

// ============================================
// ANALYTICS YOU CAN BUILD
// ============================================

// Top missed skills across all students (if using Firebase)
const analyzeGlobalWeaknesses = async () => {
  const scoresRef = collection(db, 'artifacts', appId, 'public', 'data', 'scores');
  const allScores = await getDocs(scoresRef);
  
  const globalStats = {};
  allScores.forEach(doc => {
    const data = doc.data();
    if (data.weaknessStats) {
      Object.entries(data.weaknessStats.missedBySkill || {}).forEach(([skill, count]) => {
        globalStats[skill] = (globalStats[skill] || 0) + count;
      });
    }
  });
  
  console.log('Global weak skills:', globalStats);
};

// ============================================
// FUTURE ENHANCEMENTS
// ============================================

// 1. Custom Quiz Builder
//    "Give me 10 PRIORITY + 5 LAB questions from Ch 18-20"

// 2. Spaced Repetition
//    Show missed questions again after 1 day, 3 days, 7 days

// 3. Adaptive Difficulty
//    If user is crushing APPLICATION level, bump to ANALYSIS

// 4. Study Recommendations
//    "Based on your performance, review MED_SAFETY in HIV chapters"

// 5. Progress Dashboard
//    Visual charts showing skill mastery over time

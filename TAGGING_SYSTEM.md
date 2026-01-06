# Question Tagging System - Implementation Guide

## 🎯 Overview

Your RN MASTERY game now has a **metadata tagging system** that enables:
- **Cross-chapter study modes** (Exam Traps, Priority, Labs, etc.)
- **Weakness tracking** by skill and concept (not just by question)
- **AI-powered Weakness Builder** that targets weak areas
- **Scalable architecture** for future chapters

## 📋 Tag Structure

Each question now has metadata tags:

```javascript
{
  id: "ch18_q01",           // Structured ID: chapterID_qXX
  chapter: "ch18",           // Auto-derived from ID
  concept: "INFLAMMATION",   // Core nursing concept
  skill: ["PRIORITY", "LAB_INTERPRETATION"],  // NCLEX skills tested
  bloom: "APPLICATION",      // Bloom's taxonomy level
  // ...your existing fields (text, options, correctIndex, rationale)
}
```

## 🏷️ Tag Categories

### **Concepts** (What content is tested)
- `FIRST_LINE_DEFENSE`, `IMMUNE_ORGANS`, `LEUKOCYTES`, `IMMUNOGLOBULINS`
- `HYPERSENSITIVITY`, `ANAPHYLAXIS`, `AUTOIMMUNE`, `TRANSPLANT_REJECTION`
- `OSTEOARTHRITIS`, `RHEUMATOID_ARTHRITIS`, `GOUT`, `LUPUS`
- `INFECTION_CONTROL`, `MDROS`, `TRANSMISSION`, `PPE`
- `HIV_PROGRESSION`, `HIV_TREATMENT`, `OPPORTUNISTIC_INFECTIONS`

### **Skills** (What NCLEX competency is tested)
- `PRIORITY` - "What should the nurse do first?"
- `MED_SAFETY` - Medication errors, contraindications, interactions
- `TEACHING` / `TEACHING_ERROR` - Patient education (correct vs incorrect)
- `LAB_INTERPRETATION` - Reading lab values, diagnostics
- `SEQUENCING` - Order of operations (PPE donning, steps)
- `DIFFERENTIATION` - Compare/contrast conditions
- `RECALL` - Basic knowledge retrieval

### **Bloom's Taxonomy**
- `KNOWLEDGE` - Recall facts
- `COMPREHENSION` - Understand concepts
- `APPLICATION` - Apply knowledge to scenarios
- `ANALYSIS` - Break down complex situations

## 🔧 Implementation Files

### 1. **questionTags.js** (NEW)
Contains all metadata mappings:
```javascript
export const questionTags = {
  ch18_q01: { 
    concept: "FIRST_LINE_DEFENSE", 
    skill: ["DIFFERENTIATION", "TEACHING_ERROR"], 
    bloom: "APPLICATION" 
  },
  // ...all 150 questions
};
```

**Key Functions:**
- `enrichQuestions(questions)` - Merges metadata with questions at runtime
- `getPool(allQuestions, mode, chapterId)` - Filters questions by mode
- `updateWeaknessStats(question, isCorrect, stats)` - Tracks misses by skill/concept
- `getWeaknessPool(allQuestions, weaknessStats)` - Returns prioritized weak area questions

### 2. **RNMasteryGame.jsx** (UPDATED)
- Question IDs changed from `id: 1` → `id: "ch18_q01"`
- Added `weaknessStats` state for tracking
- `submitAnswer()` now calls `updateWeaknessStats()` on wrong answers
- `startChapter()` enriches questions with `enrichQuestions()`

### 3. **ModeSelector.jsx** (NEW COMPONENT)
UI for selecting study modes:
- **Global Modes** (all chapters): Exam Traps, Priority, Labs, Sequencing, etc.
- **Chapter Review** (single chapter)
- **Weakness Builder** (AI-powered weak area focus)

## 🚀 How to Use

### Enable Mode Selection

```javascript
// In RNMasteryGame.jsx, add new gameState
const [gameState, setGameState] = useState('menu'); // 'menu' | 'modeSelect' | 'playing' | 'summary'
const [selectedMode, setSelectedMode] = useState('CHAPTER_REVIEW');

// Update menu to show mode selector
if (gameState === 'modeSelect') {
  return (
    <ModeSelector 
      chapters={INITIAL_DATA}
      weaknessStats={weaknessStats}
      onSelectMode={(mode, chapterId) => {
        setSelectedMode(mode);
        if (chapterId) {
          const chapter = INITIAL_DATA.find(c => c.id === chapterId);
          startChapter(chapter, mode);
        } else {
          startGlobalMode(mode);
        }
      }}
    />
  );
}
```

### Implement Global Modes

```javascript
const startGlobalMode = (mode) => {
  // Enrich all questions with metadata
  const allQuestions = INITIAL_DATA.flatMap(chapter => 
    enrichQuestions(chapter.questions)
  );
  
  // Filter by mode
  let pool;
  if (mode === 'WEAKNESS_BUILDER') {
    pool = getWeaknessPool(allQuestions, weaknessStats);
  } else {
    pool = getPool(allQuestions, mode);
  }
  
  // Shuffle and limit to 25 questions
  const shuffled = shuffleArray(pool).slice(0, 25);
  
  // Create virtual chapter
  const virtualChapter = {
    id: mode.toLowerCase(),
    title: getModeTitle(mode),
    questions: shuffled
  };
  
  setActiveChapter(virtualChapter);
  setGameState('playing');
};

const getModeTitle = (mode) => {
  const titles = {
    EXAM_TRAPS: '⚠️ Exam Traps Mode',
    PRIORITY_FIRST: '🎯 Priority Questions',
    LABS_DIAGNOSTICS: '🧪 Labs & Diagnostics',
    SEQUENCING: '📋 Sequencing',
    DIFFERENTIATION: '🔍 Compare & Contrast',
    WEAKNESS_BUILDER: '🧠 Weakness Builder'
  };
  return titles[mode] || mode;
};
```

## 📊 Weakness Tracking

### Storage Structure
```javascript
{
  missedBySkill: {
    "PRIORITY": 5,
    "MED_SAFETY": 3,
    "LAB_INTERPRETATION": 7
  },
  missedByConcept: {
    "ANAPHYLAXIS": 2,
    "GOUT": 4,
    "HIV_TREATMENT": 3
  },
  missedByBloom: {
    "APPLICATION": 8,
    "ANALYSIS": 5
  }
}
```

### Display Weakness Insights

```javascript
// In Summary screen, show top weaknesses
const TopWeaknesses = ({ weaknessStats }) => {
  const topSkills = Object.entries(weaknessStats.missedBySkill || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const topConcepts = Object.entries(weaknessStats.missedByConcept || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mt-6">
      <h3 className="text-xl font-bold mb-4 text-red-300">📊 Your Weak Areas</h3>
      
      <div className="mb-4">
        <h4 className="font-bold text-sm text-red-200 mb-2">Skills to Practice:</h4>
        {topSkills.map(([skill, count]) => (
          <div key={skill} className="flex justify-between text-sm mb-1">
            <span>{skill.replace(/_/g, ' ')}</span>
            <span className="text-red-400">{count} missed</span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-bold text-sm text-red-200 mb-2">Concepts to Review:</h4>
        {topConcepts.map(([concept, count]) => (
          <div key={concept} className="flex justify-between text-sm mb-1">
            <span>{concept.replace(/_/g, ' ')}</span>
            <span className="text-red-400">{count} missed</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => startGlobalMode('WEAKNESS_BUILDER')}
        className="w-full mt-4 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        🧠 Practice Weak Areas Now
      </button>
    </div>
  );
};
```

## ✅ Adding New Questions

### With Tags (Recommended)
```javascript
// 1. Add question to chapter in RNMasteryGame.jsx
{
  id: "ch18_q26",
  text: "Which lab value indicates neutropenia?",
  options: ["<1500", "<5000", ">10000", ">15000"],
  correctIndex: 0,
  rationale: "Neutropenia is defined as absolute neutrophil count <1500/mm³."
}

// 2. Add metadata to questionTags.js
ch18_q26: { 
  concept: "LAB_VALUES", 
  skill: ["LAB_INTERPRETATION", "PRIORITY"], 
  bloom: "APPLICATION" 
}
```

### Without Tags (Still Works)
Questions without tags will still function in Chapter Review mode but won't appear in filtered modes.

## 🎓 Benefits

### For Students
- **Targeted Practice** - Focus on weak areas automatically
- **Cross-Chapter Learning** - See patterns across all content
- **NCLEX Skills** - Practice specific competencies
- **AI-Powered Insights** - "This feels like AI" weakness detection

### For You (Developer)
- **No Content Duplication** - One question, many modes
- **Gradual Tagging** - Tag chapters as you go
- **Easy Expansion** - Add new modes without touching questions
- **Analytics Ready** - Rich data for performance tracking

## 🔮 Future Enhancements

1. **Adaptive Difficulty** - Adjust based on performance
2. **Spaced Repetition** - Re-show questions at optimal intervals
3. **Custom Quiz Builder** - "Give me 10 priority + 5 lab questions from Ch 18-20"
4. **Progress Dashboard** - Visual analytics by skill/concept
5. **Study Recommendations** - "You should focus on MED_SAFETY in HIV chapters"

## 📝 Quick Reference

| Mode | Filters By | Use Case |
|------|-----------|----------|
| CHAPTER_REVIEW | Chapter ID only | Complete chapter practice |
| EXAM_TRAPS | MED_SAFETY, TEACHING_ERROR | Common mistakes |
| PRIORITY_FIRST | PRIORITY skill | "What to do first" |
| LABS_DIAGNOSTICS | LAB_INTERPRETATION | Read values |
| SEQUENCING | SEQUENCING skill | Order of operations |
| DIFFERENTIATION | DIFFERENTIATION skill | Compare conditions |
| WEAKNESS_BUILDER | Missed skills/concepts | Targeted remediation |

## 💡 Pro Tips

1. **Tag in Batches** - Do one chapter at a time
2. **Use Multiple Skills** - Most questions test 2-3 skills
3. **Be Consistent** - Use same concept names across chapters
4. **Test Modes Early** - Verify filtering works with partial tags
5. **Watch localStorage** - Clear `rnMasteryWeakness` to reset stats

---

**Ready to implement?** Start by enabling ModeSelector in your menu, then test with existing tagged questions!

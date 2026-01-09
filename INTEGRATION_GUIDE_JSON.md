# Integration Guide: Migrating to JSON Question Loader

## Overview

This guide shows how to migrate from hardcoded `INITIAL_DATA` to the new JSON-based question loader.

## Step 1: Import the Bridge Module

Replace the `INITIAL_DATA` constant with imports from the bridge:

### Before:
```javascript
// --- DATA ---
const INITIAL_DATA = [
  {
    id: 'ch18',
    title: 'Ch 18: Immune Assessment',
    icon: <Shield className="w-6 h-6" />,
    description: 'Anatomy, function, and assessment.',
    questions: [
      { /* hundreds of questions */ }
    ]
  },
  // ... more chapters
];
```

### After:
```javascript
import { 
  initializeQuestions,
  getAllChapters,
  getChapterQuestions,
  getChapterWithQuestions,
  getQuestionStats
} from './utils/questionBridge';

// No more INITIAL_DATA constant needed!
```

## Step 2: Initialize on App Mount

Add initialization in a `useEffect` hook:

### Add to Component:
```javascript
function RNMasteryGame() {
  const [chaptersLoaded, setChaptersLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Initialize questions on mount
  useEffect(() => {
    initializeQuestions()
      .then((success) => {
        if (success) {
          setChaptersLoaded(true);
          console.log('📚 Questions loaded:', getQuestionStats());
        } else {
          setLoadError('Failed to load questions');
        }
      })
      .catch((error) => {
        console.error('Error initializing questions:', error);
        setLoadError(error.message);
      });
  }, []);

  // Show loading state
  if (!chaptersLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading questions...</p>
          {loadError && <p className="text-red-500 mt-2">{loadError}</p>}
        </div>
      </div>
    );
  }

  // Rest of component...
}
```

## Step 3: Replace INITIAL_DATA References

### Finding Chapters (Chapter Selector)

**Before:**
```javascript
const allChapters = [...INITIAL_DATA, ...customChapters];
```

**After:**
```javascript
const allChapters = [...getAllChapters(), ...customChapters];
```

### Loading Questions for a Chapter

**Before:**
```javascript
const chapter = INITIAL_DATA.find(c => c.id === chapterId);
const chapterQuestions = chapter?.questions || [];
setQuestions(chapterQuestions);
```

**After:**
```javascript
// Option 1: Load questions separately (recommended)
const questions = getChapterQuestions(chapterId, true); // true = shuffle
setQuestions(questions);

// Option 2: Load complete chapter with questions
const chapter = getChapterWithQuestions(chapterId, true);
if (chapter) {
  setQuestions(chapter.questions);
}
```

### Starting a Game with Specific Questions

**Before:**
```javascript
function startChapter(chapterId) {
  const chapter = INITIAL_DATA.find(c => c.id === chapterId);
  if (chapter) {
    const shuffled = [...chapter.questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setActiveChapter(chapter);
    setGameState('playing');
  }
}
```

**After:**
```javascript
function startChapter(chapterId) {
  const chapter = getChapterWithQuestions(chapterId, true); // Auto-shuffled
  if (chapter) {
    setQuestions(chapter.questions); // Already a safe copy
    setActiveChapter(chapter);
    setGameState('playing');
  }
}
```

## Step 4: Handle Challenge/Special Modes

### Before:
```javascript
const challengeQuestions = getChallengeScenarios(); // From import
```

### After:
```javascript
const challengeQuestions = getChapterQuestions('challenge-mode', true);
```

### Clinical Judgment Mode:
```javascript
const clinicalQuestions = getChapterQuestions('day-to-be-wrong', true);
```

## Step 5: Update Remediation/Random Question Selection

### Before:
```javascript
function getRemediationQuestions(missedIds) {
  const allQuestions = INITIAL_DATA.flatMap(ch => ch.questions);
  return allQuestions.filter(q => missedIds.includes(q.id));
}
```

### After:
```javascript
function getRemediationQuestions(missedIds) {
  const allChapters = getAllChapters();
  const allQuestions = [];
  
  allChapters.forEach(ch => {
    const questions = getChapterQuestions(ch.id, false); // Don't shuffle
    allQuestions.push(...questions);
  });
  
  return allQuestions.filter(q => missedIds.includes(q.id));
}
```

## Step 6: Display Stats/Progress

### Before:
```javascript
const totalQuestions = INITIAL_DATA.reduce((sum, ch) => sum + ch.questions.length, 0);
```

### After:
```javascript
const stats = getQuestionStats();
const totalQuestions = stats.totalQuestions;
console.log(`📊 Total questions: ${totalQuestions}`);
console.log(`📚 Question banks: ${stats.questionBanks}`);
```

## Complete Example: Updated startChapter Function

```javascript
function startChapter(chapterId) {
  try {
    // Load chapter with shuffled questions
    const chapter = getChapterWithQuestions(chapterId, true);
    
    if (!chapter) {
      console.error(`Chapter not found: ${chapterId}`);
      return;
    }
    
    if (chapter.questions.length === 0) {
      console.warn(`No questions available for: ${chapterId}`);
      return;
    }
    
    // Set game state
    setActiveChapter(chapter);
    setQuestions(chapter.questions); // Safe copy - can modify freely
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMissedQuestions([]);
    setGameState('playing');
    
    console.log(`🎮 Started ${chapter.title} with ${chapter.questions.length} questions`);
    
  } catch (error) {
    console.error('Error starting chapter:', error);
    setGameState('error');
  }
}
```

## Benefits of This Approach

✅ **Immutability** - Original JSON never modified  
✅ **Validation** - Questions validated on load  
✅ **Performance** - Questions loaded on-demand  
✅ **Maintainability** - Easy to add/edit questions  
✅ **Testing** - Can test questions independently  
✅ **Backwards Compatible** - Minimal code changes  

## Migration Checklist

- [ ] Import bridge module functions
- [ ] Add `initializeQuestions()` in useEffect
- [ ] Replace `INITIAL_DATA.find()` with `getAllChapters()`
- [ ] Replace direct question access with `getChapterQuestions()`
- [ ] Update challenge mode to use `getChapterQuestions('challenge-mode')`
- [ ] Update clinical judgment to use `getChapterQuestions('day-to-be-wrong')`
- [ ] Test all game modes
- [ ] Verify question shuffling works
- [ ] Check remediation mode
- [ ] Verify leaderboard integration
- [ ] Test with empty question banks (error handling)

## Testing

```javascript
// Test in browser console after app loads:
import { getQuestionStats, getChapterQuestions } from './utils/questionBridge';

// Check stats
console.log(getQuestionStats());

// Load a chapter
const ch18 = getChapterQuestions('ch18', false);
console.log('Ch 18 questions:', ch18.length);

// Verify immutability
const original = getChapterQuestions('ch18', false);
const copy = getChapterQuestions('ch18', false);
console.log('Same reference?', original === copy); // Should be false
```

## Troubleshooting

### "QuestionLoader not initialized"
- Make sure `initializeQuestions()` is called before any `get*` functions
- Check that it's in a `useEffect` with empty dependencies `[]`

### Questions not loading
- Check browser console for network errors
- Verify JSON files exist in `/data/` folder
- Check file paths in `questionLoader.js`

### Validation warnings
- Open browser console to see validation results
- Fix any missing required fields in JSON files
- Re-run the app to validate

---

**Need Help?** Check the [data/README.md](../data/README.md) for JSON schema details.

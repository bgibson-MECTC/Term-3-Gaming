# Question Data Folder

## 📁 Structure

This folder contains the **source of truth** for all game questions in JSON format.

```
data/
├── chapters.json                      # Chapter metadata (titles, icons, descriptions)
├── challenge-scenarios.json           # Challenge mode questions
├── clinical-judgment-scenarios.json   # "A Day to be Wrong" hard mode scenarios
├── ch18-questions.json               # Chapter 18: Immune Assessment (TO BE CREATED)
├── ch19-questions.json               # Chapter 19: Immune Disorders (TO BE CREATED)
├── ch20-questions.json               # Chapter 20: Connective Tissue (TO BE CREATED)
├── ch21-questions.json               # Chapter 21: MDROs (TO BE CREATED)
├── ch22-questions.json               # Chapter 22: HIV/AIDS (TO BE CREATED)
└── quiz1-questions.json              # Quiz 1 Review Questions (TO BE CREATED)
```

## 🔒 Critical Rules

### 1. JSON is the Source of Truth
- **NEVER** modify JSON files during gameplay
- **NEVER** mutate loaded question objects
- All edits to questions must be made in the JSON files

### 2. Immutability
- The `QuestionLoader` utility returns **deep copies** for gameplay
- Original JSON data is frozen after loading
- Any shuffling/randomization happens on copies only

### 3. Validation
- All questions are validated on load
- Missing required fields trigger warnings
- Invalid questions are logged to console

## 📝 Question Schema

### Standard Questions (Chapters 18-22, Quiz 1)
```json
{
  "id": "ch18_q01",
  "text": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "rationale": "Explanation of correct answer"
}
```

**Required Fields:**
- `id` (string): Unique identifier
- `text` (string): Question text
- `options` (array): Array of answer choices
- `correctIndex` (number): Index of correct answer (0-based)
- `rationale` (string): Explanation for learning

---

### Challenge Mode Questions
```json
{
  "id": "mdro_cd_01",
  "title": "C. diff or just diarrhea?",
  "prompt": "Pick the least dangerous FIRST action.",
  "stem": "Clinical scenario description...",
  "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
  "correctIndex": 2,
  "rationaleCorrect": "Why this answer is correct",
  "rationaleWrong": [
    "Why choice A is wrong",
    "Why choice B is wrong",
    "Correct.",
    "Why choice D is wrong"
  ],
  "consequenceIfWrong": "What happens if wrong choice is made",
  "difficulty": 4,
  "timerSeconds": 60
}
```

**Required Fields:**
- `id` (string): Unique identifier
- `title` (string): Short title
- `prompt` (string): Question prompt
- `stem` (string): Clinical scenario
- `choices` (array): Answer options
- `correctIndex` (number|array): Correct answer(s)
- `rationaleCorrect` (string): Why answer is correct
- `rationaleWrong` (array): Explanations for each choice
- `difficulty` (number): 1-10 difficulty rating
- `timerSeconds` (number): Time limit in seconds

---

### Clinical Judgment Questions
```json
{
  "id": "ld_q01_mdro_moral_injury",
  "text": "Question text",
  "scenario": "Detailed clinical scenario",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 2,
  "timeLimit": 45,
  "rationale": "Detailed explanation",
  "skill": ["CLINICAL_JUDGMENT", "PRIORITY"],
  "bloom": "EVALUATE",
  "difficulty": 5,
  "examTip": "NCLEX-style tip"
}
```

**Required Fields:**
- `id` (string): Unique identifier
- `text` (string): Question text
- `scenario` (string): Clinical scenario
- `options` (array): Answer choices
- `correctIndex` (number|array): Correct answer(s)
- `timeLimit` (number): Time limit in seconds
- `rationale` (string): Detailed explanation
- `skill` (array): Skills tested
- `bloom` (string): Bloom's taxonomy level
- `difficulty` (number): 1-10 difficulty rating

## 🔧 Usage

### Loading Questions in the App

```javascript
import questionLoader from './utils/questionLoader';

// Initialize once on app start
await questionLoader.initialize();

// Get a shuffled copy for gameplay (SAFE - creates copy)
const questions = questionLoader.getQuestionsForChapter('ch18');

// Get original for reference only (IMMUTABLE - frozen)
const original = questionLoader.getRawQuestions('ch18');

// Get random subset
const randomQuestions = questionLoader.getRandomQuestions('ch18', 10);

// Get stats
const stats = questionLoader.getStats();
console.log(stats);
// { chapters: 7, questionBanks: 3, totalQuestions: 156, ... }
```

### Validating Questions

```javascript
import { validateQuestions, logValidationResults } from './utils/questionValidator';

const questions = [...]; // Your question array
const results = validateQuestions(questions, 'standard');

// Log results to console
logValidationResults(results, true); // verbose mode
```

## ✅ Validation Rules

The validator checks:
- ✅ All required fields are present
- ✅ Field types are correct
- ✅ At least 2 answer options exist
- ✅ All options have content
- ✅ `correctIndex` is within valid range
- ⚠️  Rationale exists (warning if missing)

## 📊 Data Migration Status

### ✅ Completed
- [x] `chapters.json` - Chapter metadata
- [x] `challenge-scenarios.json` - 5 challenge scenarios
- [x] `clinical-judgment-scenarios.json` - 1 sample scenario
- [x] Validation utility created
- [x] Loader utility created

### 🚧 To Do
- [ ] Extract Ch 18 questions (25 questions)
- [ ] Extract Ch 19 questions (25 questions)
- [ ] Extract Ch 20 questions (25 questions)
- [ ] Extract Ch 21 questions (25 questions)
- [ ] Extract Ch 22 questions (25 questions)
- [ ] Extract Quiz 1 questions (25 questions)
- [ ] Extract all clinical judgment scenarios
- [ ] Update `RNMasteryGame.jsx` to use loader
- [ ] Test gameplay with JSON-loaded questions

## 🛠️ Development Workflow

### Adding New Questions

1. Create/edit JSON file in `data/` folder
2. Follow the appropriate schema
3. Run validation:
   ```bash
   npm run validate-questions
   ```
4. Fix any errors/warnings
5. Test in game

### Modifying Existing Questions

1. Edit JSON file directly
2. Validate changes
3. Reload app (questions re-loaded from JSON)

### Never Do This ❌

```javascript
// WRONG - Mutates the original
const questions = questionLoader.getRawQuestions('ch18');
questions[0].text = "Modified text"; // ERROR - This will throw

// WRONG - Modifying the copy affects gameplay
const questions = questionLoader.getQuestionsForChapter('ch18');
questions.splice(0, 5); // This affects the current game session

// CORRECT - Get a fresh copy each time
function startNewGame() {
  const questions = questionLoader.getQuestionsForChapter('ch18');
  // Now safe to shuffle, filter, or modify
}
```

## 📈 Benefits of JSON Source of Truth

1. **Version Control** - Easy to track question changes in git
2. **Collaboration** - Multiple people can edit questions safely
3. **Data Integrity** - Validation catches errors early
4. **Maintainability** - No code changes needed to update content
5. **Testability** - Can test questions independently of UI
6. **Exportability** - Can use questions in other tools/formats

## 🔍 Example Validation Output

```
═══════════════════════════════════════
📋 QUESTION VALIDATION RESULTS
═══════════════════════════════════════
Total Questions: 25
✅ Valid: 24
❌ Invalid: 1
═══════════════════════════════════════

🔍 ch18_q15 (Index: 14)
  ❌ Errors:
     - Missing required field: rationale
  ⚠️  Warnings:
     - No rationale provided - students won't learn from mistakes
```

---

**Last Updated:** 2026-01-08  
**Maintainer:** Development Team

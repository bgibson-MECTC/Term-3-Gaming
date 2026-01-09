# 📚 Adding Content Without Coding

This guide shows you how to add new chapters, questions, and even entire games **without writing any code**. Just edit JSON files!

## 🎯 Quick Start: Adding a New Chapter

### Step 1: Add Chapter to Registry

Edit `/data/chapters.json`:

```json
{
  "id": "ch23",
  "title": "Ch 23: Cardiovascular Assessment",
  "description": "Heart anatomy, ECG basics, cardiac diseases",
  "iconName": "Heart",
  "tags": ["cardiovascular", "assessment"],
  "difficulty": "intermediate",
  "estimatedTime": 45
}
```

### Step 2: Create Question File

Create `/data/ch23-questions.json`:

```json
[
  {
    "id": "ch23_q01",
    "text": "A patient presents with crushing chest pain. What is the priority action?",
    "options": [
      "Obtain ECG within 10 minutes",
      "Administer aspirin 325mg",
      "Start oxygen at 2L NC",
      "Call the physician"
    ],
    "correctIndex": 0,
    "rationale": "ECG within 10 minutes is the standard for suspected MI to determine if STEMI requires immediate cath lab.",
    "tags": {
      "concept": "ACS",
      "skill": "Priority",
      "bloom": "Apply"
    }
  }
]
```

### Step 3: Done! 🎉

Your chapter now automatically appears in:
- ✅ Main menu chapter selector
- ✅ All study modes
- ✅ Ranked mode
- ✅ Any game that supports dynamic chapters

---

## 🎮 Adding a New Game Mode

### Step 1: Add to Game Registry

Edit `/data/games-registry.json`:

```json
{
  "id": "medication-calc",
  "title": "Medication Calculations",
  "description": "Practice drug calculations and dosing",
  "icon": "Calculator",
  "category": "study",
  "color": "from-green-500 to-emerald-600",
  "enabled": true,
  "modes": ["practice", "timed"],
  "supportsDynamicChapters": true
}
```

### Step 2: Create Game Component (Optional)

If your game uses special logic, create `/src/games/MedicationCalc.jsx`. Otherwise, it will use the default game engine.

### Step 3: Enable It

That's it! The hub will automatically show your new game.

---

## 📊 Available Icon Names

Use these in `iconName` field:

**Medical:**
- `Heart`, `Brain`, `Activity`, `AlertCircle`
- `Shield`, `Bone`, `Bug`, `Zap`

**UI:**
- `BookOpen`, `Trophy`, `Crown`, `Target`
- `Clock`, `Calculator`, `Scale`, `Users`

**Academic:**
- `GraduationCap`, `Brain`, `Users`

---

## 🎨 Available Color Gradients

Use these in `color` field:

```
from-blue-500 to-indigo-600      (Professional Blue)
from-purple-500 to-pink-600      (Clinical Purple)
from-orange-500 to-red-600       (High Stakes Red)
from-green-500 to-emerald-600    (Success Green)
from-yellow-500 to-amber-600     (Warning Yellow)
```

---

## 📝 Question Structure Reference

### Standard Question
```json
{
  "id": "unique_id",
  "text": "Question text here?",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "rationale": "Explanation of correct answer",
  "tags": {
    "concept": "Main Topic",
    "skill": "Knowledge|Comprehension|Apply|Analyze",
    "bloom": "Knowledge|Comprehension|Application|Analysis"
  }
}
```

### Select All That Apply (SATA)
```json
{
  "id": "sata_01",
  "type": "SATA",
  "text": "Select all correct nursing actions:",
  "options": ["A", "B", "C", "D", "E"],
  "correctIndices": [0, 2, 4],
  "rationale": "Explain each choice"
}
```

### Priority/Ordering Question
```json
{
  "id": "priority_01",
  "type": "priority",
  "text": "Which patient should you see first?",
  "options": ["Patient A", "Patient B", "Patient C", "Patient D"],
  "correctIndex": 0,
  "priorityLevel": "ABC",
  "rationale": "Why this patient is highest priority"
}
```

### Clinical Judgment ("Least Dangerous")
```json
{
  "id": "judgment_01",
  "type": "clinical-judgment",
  "text": "All these actions are suboptimal. Which is LEAST dangerous?",
  "options": ["Bad option 1", "Bad option 2", "Bad option 3", "Bad option 4"],
  "correctIndex": 2,
  "consequences": [
    "Why option 1 is dangerous",
    "Why option 2 is dangerous",
    "Why option 3 is least bad",
    "Why option 4 is dangerous"
  ],
  "dangerLevels": [9, 8, 3, 10]
}
```

---

## 🏗️ File Structure

```
data/
├── chapters.json          ← Chapter registry
├── games-registry.json    ← Game/mode registry
├── ch18-questions.json    ← Chapter 18 questions
├── ch19-questions.json    ← Chapter 19 questions
├── ch23-questions.json    ← YOUR NEW CHAPTER
└── custom-game.json       ← Custom game questions
```

---

## ✅ Validation

Questions are automatically validated when loaded. If there's an error:

1. Open browser console (F12)
2. Look for validation errors
3. Fix the JSON structure
4. Reload page

Common errors:
- ❌ Missing `id` field
- ❌ Missing `correctIndex`
- ❌ `correctIndex` out of range
- ❌ Empty `options` array
- ❌ Invalid JSON syntax (missing comma, bracket, etc.)

---

## 🚀 Testing Your Changes

1. **Add your chapter/questions**
2. **Refresh the page** (Ctrl+R)
3. **Check console** for validation messages
4. **Select your chapter** from the menu
5. **Play a question** to test

---

## 💡 Pro Tips

### Bulk Import
Create questions in Excel/Sheets, export as CSV, then use a converter tool to JSON.

### Question IDs
Use format: `ch[##]_q[##]` for chapters, `custom_[name]_q[##]` for custom sets.

### Tags
Good tags enable powerful filtering:
- `concept`: Main topic (e.g., "Sepsis", "Heart Failure")
- `skill`: Nursing process step
- `bloom`: Cognitive level

### Difficulty
- `beginner`: Basic recall
- `intermediate`: Application
- `advanced`: Analysis/Synthesis

---

## 🎯 Examples

### Medical-Surgical Chapter
```json
{
  "id": "ch24",
  "title": "Ch 24: Respiratory Disorders",
  "description": "COPD, Asthma, Pneumonia, TB",
  "iconName": "Activity",
  "tags": ["respiratory", "medical-surgical"],
  "difficulty": "intermediate"
}
```

### Pharmacology Game
```json
{
  "id": "pharm-challenge",
  "title": "Pharmacology Challenge",
  "description": "Drug classes, side effects, interactions",
  "icon": "Zap",
  "category": "challenge",
  "color": "from-purple-500 to-indigo-600",
  "enabled": true,
  "modes": ["timed", "survival"],
  "supportsDynamicChapters": false
}
```

---

## 🆘 Need Help?

1. **Validation errors?** Check console (F12) for specific issues
2. **JSON syntax?** Use [JSONLint.com](https://jsonlint.com) to validate
3. **Icons not showing?** Check available icon names above
4. **Game not appearing?** Make sure `enabled: true`

---

## 🎓 You're Ready!

You can now add:
- ✅ New chapters (edit 2 files)
- ✅ New questions (add to chapter file)
- ✅ New games (edit 1 file)
- ✅ Custom modes (edit 1 file)

**No coding required!** 🎉

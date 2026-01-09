# 🎮 Nursing Education Hub

A **dynamic, configuration-driven educational gaming platform** where instructors can add chapters, questions, and entire games **without writing any code** — just edit JSON files!

## 🚀 What's New: Hub System

### Before (Old Way):
- ❌ Had to edit React code to add chapters
- ❌ Hardcoded game modes
- ❌ Single monolithic app
- ❌ Required developer knowledge

### After (New Way):
- ✅ Add chapters by editing JSON
- ✅ Create games via configuration
- ✅ Hub interface for multiple games
- ✅ No coding required!

---

## 📚 Quick Start: Add a New Chapter (5 minutes)

### 1. Register the Chapter
Edit `src/config/chapters.json`:

```json
{
  "id": "ch23",
  "title": "Ch 23: Cardiovascular", 
  "description": "Heart anatomy, ECG, cardiac diseases",
  "iconName": "Heart"
}
```

### 2. Create Questions
Create `data/ch23-questions.json`:

```json
[
  {
    "id": "ch23_q01",
    "text": "What is the priority for suspected MI?",
    "options": ["ECG in 10min", "Call MD", "Give O2", "Morphine"],
    "correctIndex": 0,
    "rationale": "ECG within 10 minutes determines if STEMI requires immediate catheterization.",
    "tags": {
      "concept": "ACS",
      "skill": "Priority", 
      "bloom": "Application"
    }
  }
]
```

### 3. Refresh Browser
Your chapter now appears automatically in **all compatible game modes**! 🎉

**Complete Guide:** See [QUICK_START_ADD_CHAPTER.md](QUICK_START_ADD_CHAPTER.md)

---

## 🎯 Available Games

### 1. **RN Mastery Quiz** 
Standard chapter-based review with Study and Ranked modes
- Dynamic chapter support: YES
- Modes: Study, Ranked
- Features: AI tutor, weakness tracking, remediation

### 2. **A Day to be Wrong**
Clinical judgment game where every answer is suboptimal
- Scenario: Choose the "least dangerous" wrong answer
- Resource management (Isolation Room, Emergency Pass, MD Call)
- Escalating consequences

### 3. **Challenge Mode**
Time-based resource management scenarios  
- Coming soon with hub integration

### 4. **Instructor Panel**
Live classroom management and judgment scoring
- Real-time student monitoring
- Manual scoring for discussions

---

## 🎮 How to Add a New Game

Edit `src/config/games-registry.json`:

```json
{
  "id": "med-calc",
  "title": "Medication Calculations",
  "description": "Practice drug dosing and calculations",
  "icon": "Calculator",
  "category": "study",
  "color": "from-green-500 to-emerald-600",
  "enabled": true,
  "modes": ["practice", "timed"],
  "supportsDynamicChapters": true
}
```

**That's it!** The hub automatically loads and displays it. 

If you need custom logic, create a component at `src/games/YourGame.jsx`.

---

## 📂 Project Structure

```
src/
├── config/
│   ├── chapters.json          ← Chapter registry
│   └── games-registry.json    ← Game/mode definitions
├── utils/
│   ├── chapterManager.js      ← Dynamic chapter loading
│   ├── gameRegistry.js        ← Game system loader
│   ├── questionLoader.js      ← Question file importer
│   └── questionValidator.js   ← Automatic validation
├── components/
│   └── GameHub.jsx            ← Main hub interface
└── App.js                     ← Router between hub and games

data/
├── ch18-questions.json        ← Chapter question banks
├── ch19-questions.json
├── ch23-questions-EXAMPLE.json ← Template for new chapters
└── clinical-judgment-scenarios.json
```

---

## 🏗️ Architecture

### Hub System
```
GameHub → Loads games from games-registry.json
   ↓
Displays categories and games dynamically
   ↓
User selects game → Routes to game component
   ↓
Game loads chapters from chapterManager
   ↓
Questions loaded via questionLoader
```

### Adding Content Flow
```
Edit JSON → Save → Refresh browser → Content appears
```

No build step, no code changes, no deployment!*

*For production deployment, run `npm run build && npm run deploy`

---

## 🎨 Available Features

### Icons
`Heart`, `Brain`, `Activity`, `Shield`, `Bug`, `Bone`, `Calculator`, `Stethoscope`, `Pill`, `Syringe`, `Hospital`

### Question Types
- **Standard**: Single correct answer
- **SATA**: Select all that apply
- **Priority**: Order matters (ABC, Maslow, Safety)
- **Clinical Judgment**: "Least dangerous" wrong answer

### Difficulty Levels
- `beginner`: Basic recall
- `intermediate`: Application
- `advanced`: Analysis/synthesis

### Tags
- `concept`: Main topic (e.g., "Heart Failure", "Sepsis")
- `skill`: Nursing process (Assessment, Analysis, Planning, etc.)
- `bloom`: Cognitive level (Knowledge, Comprehension, Application, Analysis)

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START_ADD_CHAPTER.md](QUICK_START_ADD_CHAPTER.md) | 5-minute guide to add a chapter |
| [ADDING_CONTENT.md](ADDING_CONTENT.md) | Complete reference for content creation |
| [GAME_FLOW_DIAGRAM.md](GAME_FLOW_DIAGRAM.md) | Visual game logic diagrams |
| [data/README.md](data/README.md) | Question file specifications |

---

## 🚀 Deployment

### Development
```bash
npm start
```
Runs at http://localhost:3000/Term-3-Gaming

### Production Build
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

Live at: https://bgibson-mectc.github.io/Term-3-Gaming

---

## ✅ Validation

All questions are automatically validated on load. Check browser console (F12) for:

```
✅ Question system initialized
📊 Stats: { chapters: 7, totalQuestions: 250 }
```

If errors appear:
1. Open console to see specific validation messages
2. Fix JSON syntax/structure
3. Refresh browser

Common issues:
- Missing required fields (`id`, `text`, `options`, `correctIndex`)
- `correctIndex` out of range
- Invalid JSON syntax

---

## 🎓 Use Cases

### For Instructors
- ✅ Add exam questions without IT support
- ✅ Create custom review sets for any topic
- ✅ Launch clinical judgment scenarios
- ✅ Monitor student progress via Firebase

### For Students
- ✅ Self-paced chapter review
- ✅ Competitive ranked mode
- ✅ Immediate feedback with rationales
- ✅ AI tutor for explanations
- ✅ Weakness tracking and remediation

### For Curriculum Teams
- ✅ Rapidly deploy new content
- ✅ A/B test question effectiveness
- ✅ Track learning analytics
- ✅ Export/import question banks

---

## 🔧 Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Icons**: Lucide React
- **Database**: Firebase Firestore (leaderboards, analytics)
- **Auth**: Firebase Anonymous Auth
- **AI**: Gemini 2.5 Flash (tutor feature)
- **Deployment**: GitHub Pages
- **Build**: Create React App

---

## 📊 Analytics

Data tracked via Firebase:
- Question attempt rates
- Time per question
- Confidence vs correctness
- Concept mastery levels
- Student engagement patterns

Access via Firebase Console or export to sheets.

---

## 🆘 Support

**For Content Issues:**
- Check [ADDING_CONTENT.md](ADDING_CONTENT.md)
- Validate JSON at jsonlint.com
- Check browser console (F12)

**For Technical Issues:**
- Create GitHub issue
- Include console errors
- Describe steps to reproduce

**For Feature Requests:**
- Edit `src/config/games-registry.json` to add games
- Create pull request with new game components
- Open issue to discuss major features

---

## 📝 License

Educational use - Nursing program specific.

---

## 🎉 Getting Started

1. **Clone the repo**
2. **npm install**
3. **npm start**
4. **Open the Hub** - select a game!
5. **Add your first chapter** - see QUICK_START_ADD_CHAPTER.md

**No coding required to add content! Just edit JSON files.** 🚀

---

Built with ❤️ for nursing education

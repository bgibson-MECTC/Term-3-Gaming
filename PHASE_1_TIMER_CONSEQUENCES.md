# Phase 1: Timer & Consequence System ⏱️

## Overview
Enhanced "⚖️ A Day to be Wrong" with timed clinical judgment scenarios where **every answer has consequences**. Students experience realistic patient outcomes based on their decisions.

## Features Implemented ✅

### 1. Custom Timer System
- **Variable Time Limits**: Each question has its own time limit (30-90 seconds)
  - MDRO isolation: 60 seconds
  - HIV labs: 60 seconds  
  - SATA PrEP counseling: 90 seconds (multi-select)
  - Priority flip: 45 seconds (acute assessment)
  - Needle stick: 30 seconds (emergency decision)

- **Visual Countdown**: Timer displays in header, turns:
  - Green: >20 seconds remaining
  - Yellow: 10-20 seconds
  - Red + pulsing: <10 seconds

### 2. Consequence Display 🎭
Every answer triggers immediate feedback showing **what happens to the patient**:

#### Correct Choices
```
✅ **Least dangerous choice.** 
Immunocompromised patient protected from C. diff exposure...
```

#### Wrong Choices  
```
❌ **C. diff spreads!** 
Two more patients develop diarrhea. Unit under investigation...
```

### 3. Custom Scoring System 📊
Replaces standard game scoring with clinically-focused points:

| Outcome | Points | Description |
|---------|--------|-------------|
| **Correct** | +10 | Made the safest choice under time pressure |
| **Delayed Correct** | +3 | Correct but took >45 seconds (hesitation) |
| **Wrong** | -10 | Chose more dangerous option |
| **Timeout** | 0 | No answer = no credit |

### 4. Progressive Difficulty
Questions have different complexity:
- **Simple** (30s): Immediate emergency decisions
- **Moderate** (60s): Standard clinical judgment
- **Complex** (90s): Multi-factor analysis (SATA questions)

## Technical Implementation

### Data Structure
Each question in `clinicalJudgmentScenarios.js` now has:

```javascript
{
  id: "ld_q01_mdro_isolation",
  text: "Four patients need isolation rooms...",
  timeLimit: 60, // Custom timer
  consequences: {
    0: "❌ **C. diff spreads!** Two more patients...",
    1: "❌ **Isolation delay!** Contact precautions...",
    2: "✅ **Least dangerous choice.** Immunocompromised...",
    3: "❌ **Double exposure risk!** VRE + C. diff..."
  },
  correctIndex: 2,
  rationale: "..."
}
```

### React State Management
Added consequence tracking:
```javascript
const [consequenceText, setConsequenceText] = useState(null);
```

### Timer Logic
- Reads `question.timeLimit` field
- Falls back to 30s default if not specified
- Resets between questions
- Auto-submits on timeout

### Consequence Display
- Shows immediately after answer submission
- Color-coded box (green for correct, red for wrong)
- Appears above rationale in feedback panel
- Uses Scale icon for thematic consistency

## User Experience Flow

1. **Question loads** → Custom timer starts countdown
2. **Student answers** → Consequence displays immediately
3. **Feedback shows**:
   - Consequence text (what happened)
   - Points earned/lost
   - Full rationale explaining why
4. **Next question** → Timer resets with new time limit

## What's Different from Regular Mode
| Feature | Regular Chapters | Day to be Wrong |
|---------|-----------------|-----------------|
| Timer | Fixed 30s | Variable 30-90s |
| Scoring | Complex multipliers | Simple +10/-10/+3 |
| Feedback | Standard rationale | Patient consequences first |
| Wrong answers | Point loss | -10 penalty + consequence |
| Purpose | Knowledge assessment | Clinical judgment practice |

## Next Steps (Phase 2 & 3)

### Phase 2: Resource Management
- [ ] 1 isolation room resource
- [ ] 1 emergency med pass
- [ ] 1 provider call
- [ ] Progressive consequences (wrong answers trigger new symptoms)
- [ ] Escalation chains

### Phase 3: Competitive Modes
- [ ] Team battle mode (vs other students)
- [ ] Sudden death mode (one wrong = game over)
- [ ] Leaderboard categories:
  - "Safest Unit" (fewest wrong)
  - "Least Resistance" (fastest correct)

## Testing

### To Test Phase 1:
1. Go to https://bgibson-mectc.github.io/Term-3-Gaming
2. Select **Ranked Mode**
3. Click **"⚖️ A Day to be Wrong"** chapter
4. Observe:
   - Custom timer for each question
   - Consequence text after each answer
   - Scoring system (+10/-10/+3)

### Expected Behavior:
- ✅ Timer varies by question (30s, 45s, 60s, 90s)
- ✅ Consequence displays after selection
- ✅ Points awarded: +10 correct, +3 delayed, -10 wrong
- ✅ Timeout = 0 points
- ✅ All 5 questions playable

## Design Philosophy
This mode teaches **clinical judgment** not just knowledge:
- **Time pressure** simulates real nursing decisions
- **Consequences** show real patient outcomes
- **All wrong answers** forces prioritization skills
- **Immediate feedback** reinforces cause-and-effect thinking

Students learn to ask: *"Which mistake can I live with?"* rather than *"What's the right answer?"*

---
**Status**: Phase 1 Complete ✅  
**Deployed**: https://bgibson-mectc.github.io/Term-3-Gaming  
**Build**: main.b46762c8.js  
**Date**: January 2025

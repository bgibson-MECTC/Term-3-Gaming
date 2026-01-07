# Challenge Mode: "The Least Dangerous Game"

## 🎯 Overview

Challenge Mode is a competitive classroom format where teams battle by identifying the **least dangerous** action in clinical scenarios. Teams can challenge each other's logic, and an instructor acts as judge to determine challenge success.

## 🎮 Game Flow

```
┌──────────────────────────────────────────────────────────┐
│                    TEAM LOBBY                            │
│  • Instructor adds 2-4 teams                             │
│  • Each team gets a unique color (🔴🔵🟢🟡)               │
│  • Click "Start Challenge Battle"                        │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│                 QUESTION PHASE                           │
│  • Scenario displayed with 4 choices                     │
│  • Teams submit answers (hidden from opponents)          │
│  • Instructor clicks "Open Challenge Window"            │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│                CHALLENGE PHASE                           │
│  • Teams see that answers are submitted                  │
│  • Teams can challenge opponent's logic                  │
│  • Must explain the "trap" in wrong answer              │
│  • Instructor locks challenges when done                │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  JUDGE PHASE                             │
│  • Instructor reviews challenges via Judge Panel         │
│  • Sees question, all submissions, all challenges        │
│  • Decides: Accept Challenge | Reject Challenge          │
│  • Can add optional judge notes                         │
│  • Clicks "Reveal Answer & Score Round"                 │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│                 REVEAL PHASE                             │
│  • Correct answer shown                                  │
│  • Rationale explained                                   │
│  • Consequences of wrong choices                         │
│  • Updated team scores displayed                         │
│  • Click "Next Round" to continue                       │
└──────────────────────────────────────────────────────────┘
```

## 📊 Scoring System

| Action | Points | Notes |
|--------|--------|-------|
| ✅ Correct Answer | +10 | Chose the least dangerous action |
| ❌ Wrong Answer | -10 | Chose a more dangerous option |
| ⚔️ Challenge Success | +8 | Successfully identified trap in opponent's logic |
| 🛡️ Challenge Failed | -5 | Challenge rejected by instructor |

### Example Score Progression

```
Round 1:
  Team A: Correct answer → +10 points → Total: 10
  Team B: Wrong answer → -10 points → Total: -10
  Team C challenges Team B successfully → +8 points → Total: 8

Round 2:
  Team A: Wrong answer → -10 points → Total: 0
  Team B: Correct answer → +10 points → Total: 0
  Team C: Correct answer → +10 points → Total: 18
  Team B challenges Team A successfully → +8 points → Total: 8

Final Standings: Team C: 18, Team B: 8, Team A: 0
```

## 🎲 Current Scenarios

### 1. C. diff or just diarrhea?
- **Prompt:** Pick the least dangerous FIRST action
- **Theme:** Infection control priority over diagnostics
- **Trap:** Obtaining stool sample delays isolation
- **Correct:** Initiate contact precautions + soap & water immediately
- **Timer:** 60 seconds
- **Difficulty:** 4/10

### 2. CD4 count interpretation
- **Prompt:** Which CD4 level is MOST dangerous right now?
- **Theme:** Active viral replication vs. suppressed low CD4
- **Trap:** CD4=12 looks scary but viral load undetectable = treatment working
- **Correct:** CD4=180 with viral load 45,000 (medication failure)
- **Timer:** 60 seconds
- **Difficulty:** 5/10

### 3. PrEP candidacy assessment (SATA)
- **Prompt:** Select ALL who need PrEP discussion
- **Theme:** Risk behavior assessment vs. U=U principle
- **Trap:** Partner with undetectable HIV doesn't need PrEP (U=U)
- **Correct:** MSM with multiple partners + IDU sharing needles
- **Timer:** 90 seconds
- **Difficulty:** 6/10

### 4. Four patients, one nurse
- **Prompt:** Who do you assess FIRST?
- **Theme:** Life-threatening > comfort > expected findings
- **Trap:** Post-op pain and hyperglycemia distract from meningitis
- **Correct:** Suspected bacterial meningitis patient
- **Timer:** 45 seconds
- **Difficulty:** 4/10

### 5. Needlestick aftermath
- **Prompt:** What is the FIRST priority?
- **Theme:** Immediate decontamination before reporting
- **Trap:** Reporting seems urgent but washing must come first
- **Correct:** Wash site with soap & water
- **Timer:** 30 seconds
- **Difficulty:** 5/10

## 👨‍🏫 Instructor Judge Panel Features

### During JUDGE Phase, instructors see:

1. **Question Display**
   - Full scenario text
   - All 4 answer choices
   - Clear question prompt

2. **Team Submissions**
   - Each team's chosen answer (hidden during judging)
   - Color-coded team indicators
   - Submission timestamp

3. **Challenge Cards** (expandable)
   - Challenger team name
   - Target team name
   - Trap explanation provided by challenger
   - Alternative answer suggestion

4. **Judge Controls**
   - ✅ Accept Challenge (challenger gets +8, target gets additional -5)
   - ❌ Reject Challenge (challenger gets -5)
   - Optional judge notes field
   - "Reveal Answer & Score Round" button

### Judge Decision Guidelines

**Accept Challenge When:**
- Challenger correctly identifies flawed reasoning
- Trap explanation is clinically accurate
- Target team's answer is demonstrably more dangerous

**Reject Challenge When:**
- Challenger's logic is flawed
- Trap explanation is inaccurate or incomplete
- Challenge is strategic/opportunistic without merit
- Both answers were reasonable given scenario

## 🎓 Educational Philosophy

### "Least Dangerous Game" Principle

Traditional NCLEX questions ask "What should you do FIRST?" which can feel arbitrary. Challenge Mode reframes this as:

> **"Which action puts the patient/unit at LEAST risk right now?"**

This shift:
- Emphasizes safety over memorization
- Rewards clinical judgment over test-taking strategies
- Encourages discussion about degrees of danger
- Makes incorrect answers learning opportunities

### Why Challenges Work

1. **Peer Teaching:** Students explain traps to each other
2. **Critical Thinking:** Must articulate WHY an answer is dangerous
3. **Engagement:** Competitive format maintains attention
4. **Instructor Insight:** Judge decisions reveal class understanding gaps

## 🛠️ Adding New Scenarios

Edit [`src/challengeScenarios.js`](src/challengeScenarios.js):

```javascript
{
  id: "unique_id_06",
  title: "Scenario title for UI",
  prompt: "Pick the least dangerous FIRST action.",
  stem: "Clinical situation description. Patient details. Vitals.",
  choices: [
    "Option A",
    "Option B", 
    "Option C",
    "Option D"
  ],
  correctIndex: 2, // 0-based index (2 = Option C)
  rationaleCorrect: "Why Option C is least dangerous.",
  rationaleWrong: [
    "Why Option A is more dangerous.",
    "Why Option B is more dangerous.",
    "Correct.",
    "Why Option D is more dangerous."
  ],
  consequenceIfWrong: "What happens if they choose wrong.",
  difficulty: 5, // 1-10 scale
  timerSeconds: 60
}
```

### For Multi-Select (SATA):
```javascript
correctIndex: [0, 2], // Array for multiple correct answers
```

## 🎯 Facilitation Tips

### Before the Game
- Explain scoring system clearly
- Demonstrate one challenge example
- Emphasize respectful challenges (attack logic, not people)
- Set time limits for challenge submissions

### During the Game
- Read scenarios aloud for clarity
- Give teams 30-60 seconds to discuss before submitting
- Encourage quiet collaboration during submission phase
- Allow 2-3 minutes for challenge submissions

### During Judging
- Read challenges aloud before deciding
- Explain your reasoning when accepting/rejecting
- Use judge notes to highlight learning points
- Point out close calls where multiple answers were reasonable

### After Each Round
- Pause on REVEAL phase to discuss rationale
- Ask teams to explain their thinking
- Highlight excellent challenge explanations
- Connect to real clinical experiences

## 📈 Assessment Integration

### Formative Assessment
- Track which traps students fall for repeatedly
- Identify concepts needing remediation
- Observe team collaboration quality
- Note challenge quality (clinical reasoning)

### Summative Data
- Team performance over multiple games
- Individual contribution to team discussions
- Challenge success rate (critical thinking metric)
- Improvement in trap identification

## 🎪 Variations

### Speed Round
- 30-second timer on all questions
- No challenges allowed
- Pure rapid decision-making

### Expert Mode
- All answers must include rationale
- Challenges require citing evidence
- Instructor can award bonus points for exceptional explanations

### Tournament Mode
- Bracket-style elimination
- Winning team advances
- Grand championship game

## 📂 File Structure

```
src/
├── challengeEngine.js          # Game state management
├── challengeScenarios.js       # Question database
└── components/
    └── InstructorJudgePanel.jsx # Judge UI component
```

## 🐛 Troubleshooting

**Issue:** Teams can see each other's answers
- **Fix:** Ensure submissions happen before challenge phase opens

**Issue:** Instructor panel not showing
- **Fix:** Check that game phase is JUDGE (not CHALLENGE or REVEAL)

**Issue:** Scores not updating after reveal
- **Fix:** Must click "Reveal Answer & Score Round" button

**Issue:** Challenge button clicked too fast
- **Fix:** Instructor controls challenge window opening timing

## 🎓 Learning Outcomes

By playing Challenge Mode, students will:

1. **Prioritize patient safety** over diagnostics, comfort, or routine care
2. **Identify clinical traps** (e.g., seemingly urgent but actually stable)
3. **Explain their reasoning** to peers using clinical evidence
4. **Evaluate competing priorities** in complex scenarios
5. **Think critically** about degrees of danger rather than memorizing rules

---

**Created for nursing education at MECTC | Version 1.0 | January 2026**

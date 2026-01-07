# Phase 3: Competitive Modes 🏆

## Overview
Phase 3 transforms "A Day to be Wrong" into a **competitive multiplayer experience** with three distinct game modes, category-based leaderboards, and high-stakes challenges.

## New Features Implemented ✅

### 1. Mode Selection Screen 🎮

When clicking "A Day to be Wrong," players now choose their challenge:

```
┌─────────────────────────────────────────────────┐
│        Choose Your Challenge Mode               │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎯 Solo Mission  👥 Team Battle  💀 Sudden Death│
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Three Game Modes

#### Mode 1: Solo Mission 🎯 (Classic)
**Description**: Original Phase 2 experience
- 5-9 questions (with escalations)
- Resource management
- Escalations trigger on mistakes
- Personal best tracking

**Perfect for**:
- Learning the mechanics
- Individual practice
- Mastery development

#### Mode 2: Team Battle 👥 (Competitive)
**Description**: Compete with team name recognition
- Enter team name before starting
- Same gameplay as Solo
- Scores tracked by team
- Team leaderboard visibility
- Encourages collaboration

**Perfect for**:
- Group activities
- Class competitions
- Clinical groups
- Friend challenges

**Features**:
- Team name entry (max 30 characters)
- Team identifier in header: `👥 Team: Night Shift Warriors`
- Team badge on leaderboard
- Shared glory for high scores

#### Mode 3: Sudden Death 💀 (Extreme)
**Description**: One mistake = immediate elimination
- **1 life only** - no second chances
- Any wrong answer ends game instantly
- No escalations (because you're already out!)
- Hall of Fame for survivors
- Ultimate challenge mode

**Elimination mechanics**:
- Wrong answer → Instant game over
- Shows elimination message with stats
- Records how many questions survived
- Only perfect runs complete all 5 questions

**Perfect for**:
- Expert players
- High-stakes practice
- Adrenaline junkies
- Bragging rights

### 3. Category-Based Leaderboards 📊

Four distinct leaderboard categories track different achievements:

#### 🏆 All Scores (Default)
- Top 50 scores across all modes
- Shows overall performance
- Mix of Solo, Team, and Sudden Death

#### 🛡️ Safest Unit
**Criteria**: Fewest escalations triggered
- Ranks by escalation level (0 best, 4 worst)
- Tiebreaker: Higher score wins
- Rewards careful decision-making
- Shows: "🛡️ 0 escalations" badge

**Leaderboard Example**:
```
#1 Sarah Chen        🛡️ 0 escalations    50 pts
#2 Night Hawks 👥     🛡️ 1 escalations    40 pts
#3 Marcus J.          🛡️ 1 escalations    35 pts
```

#### 💎 Resource Master
**Criteria**: Most resources preserved
- Ranks by resources intact at end (3 best, 0 worst)
- Tiebreaker: Higher score wins
- Rewards strategic resource use
- Shows: "💎 3/3 resources" badge

**Leaderboard Example**:
```
#1 Code Blue Crew 👥  💎 3/3 resources   45 pts
#2 Emma Rodriguez     💎 2/3 resources   40 pts
#3 Taylor Swift RN    💎 2/3 resources   38 pts
```

#### 💀 Sudden Death Survivors
**Criteria**: Completed all 5 questions perfectly
- Only shows players who answered all 5 correctly
- Ranks by completion (all survivors = heroes)
- Ultimate hall of fame
- Shows: "💀 5/5 perfect" badge

**Leaderboard Example**:
```
#1 Jessica Lee 💀     💀 5/5 perfect     50 pts
#2 Med Surg Legends 👥 💀 5/5 perfect    50 pts
#3 Alex Kim 💀        💀 5/5 perfect     50 pts
```

### 4. Enhanced Score Tracking

Every score now includes rich metadata:

```javascript
{
  playerName: "Night Shift Warriors",
  score: 30,
  chapterTitle: "⚖️ A Day to be Wrong",
  
  // Phase 3 additions
  mode: "team",                    // solo, team, or sudden-death
  escalationLevel: 2,              // How many crises triggered
  resourcesPreserved: 1,           // 0-3 resources remaining
  
  // Sudden Death specific
  survived: false,                 // Made it through all 5?
  questionsSurvived: 3,            // Got 3 correct before elimination
  
  // Team specific
  teamName: "Night Shift Warriors"
}
```

### 5. Visual Indicators

#### In-Game Header Updates

**Sudden Death Mode**:
```
┌────────────────────────────────────────┐
│ Exit  💀 SUDDEN DEATH - 1 LIFE  ⏱️ 45s │
└────────────────────────────────────────┘
```
(Pulsing red border, high intensity)

**Team Mode**:
```
┌──────────────────────────────────────────────┐
│ Exit  👥 Team: Code Blue Crew  ⏱️ 60s  🚪 ISO:1 │
└──────────────────────────────────────────────┘
```

#### Leaderboard Badges

- **💀**: Sudden Death mode entry
- **👥**: Team mode entry
- **🛡️**: Safest Unit category
- **💎**: Resource Master category

## Game Flow Examples

### Example 1: Solo Mission (Classic)
```
Player selects: 🎯 Solo Mission
→ Plays standard Phase 2 game
→ Score: +30, Escalation Level: 2, Resources: 1/3
→ Appears on all leaderboards
```

### Example 2: Team Battle
```
Player selects: 👥 Team Battle
→ Enters team name: "Night Shift Warriors"
→ Plays with team identifier visible
→ Score: +40, Escalation Level: 1, Resources: 2/3
→ Team name shown on leaderboard
→ Can compete against other teams
```

### Example 3: Sudden Death Success
```
Player selects: 💀 Sudden Death
→ Header shows "💀 SUDDEN DEATH - 1 LIFE"
→ Q1 ✅ Q2 ✅ Q3 ✅ Q4 ✅ Q5 ✅
→ Score: +50 (perfect)
→ Added to "Sudden Death Survivors" hall of fame
→ survived: true, questionsSurvived: 5
```

### Example 4: Sudden Death Elimination
```
Player selects: 💀 Sudden Death
→ Q1 ✅ Q2 ✅ Q3 ❌
→ INSTANT ELIMINATION MESSAGE:
   "💀 SUDDEN DEATH ELIMINATION!
    
    You answered incorrectly on Question 3.
    Final Score: 10
    Questions Survived: 2/5
    
    Only the perfect survive in Sudden Death mode!"
→ Game ends immediately
→ survived: false, questionsSurvived: 2
```

## Sudden Death Mechanics Deep Dive

### What's Different?
| Feature | Solo/Team Mode | Sudden Death |
|---------|---------------|--------------|
| **Lives** | Unlimited | 1 only |
| **Wrong answer** | -10 points, game continues | Immediate elimination |
| **Escalations** | Trigger on mistakes | Disabled (no second chances) |
| **Resources** | Not displayed | N/A (doesn't matter if you die) |
| **Completion** | Can finish with mistakes | Must be perfect or fail |
| **Timeout** | -0 points, continue | Treated as wrong = elimination |

### Elimination Flow
```
Playing → Wrong Answer → Show Rationale (2sec) → Alert Message → End Game → Summary Screen
```

### Hall of Fame Entry
Only players who answer **all 5 questions correctly** appear in Sudden Death Survivors:
- Perfect score (50 points)
- No mistakes allowed
- Elite status

## Team Battle Strategy

### Team Name Ideas
- **Clinical themes**: "Code Blue Crew", "Night Shift Warriors"
- **Units**: "ICU Avengers", "Med Surg Masters"  
- **Fun**: "Nurses Who Lunch", "The Stethoscopes"
- **School**: "Class of 2026", "Group 3 - Section B"

### Competitive Play
1. **Class Competition**: Each group picks team name, competes for top score
2. **Clinical Groups**: Hospital units compete against each other
3. **Study Groups**: Friends collaborate, share one team name
4. **Tournaments**: Bracket-style elimination across teams

### Team Scoring
- All team members can submit scores under same team name
- Highest score represents the team
- Encourages practice and improvement

## Leaderboard Category Strategy

### For "Safest Unit" 🛡️
**Goal**: Trigger 0 escalations
- Answer all 5 base questions correctly
- No mistakes = No crises
- Perfect decision-making

**Strategy**:
- Take full time to think
- Double-check each answer
- Remember consequence chains

### For "Resource Master" 💎
**Goal**: Preserve all 3 resources
- Don't trigger escalations (no resource use)
- OR trigger but choose alternatives
- Strategic resource management

**Strategy**:
- Avoid wrong answers (prevents escalations)
- If escalation triggered, choose non-resource option
- Think ahead about resource scarcity

### For "Sudden Death Survivors" 💀
**Goal**: 5/5 perfect answers
- Zero tolerance for mistakes
- Elite nursing judgment
- Ultimate achievement

**Strategy**:
- Master material first (play Solo mode multiple times)
- Use full timer on each question
- Stay calm under pressure
- One slip = game over

## Technical Implementation

### State Management
```javascript
// Phase 3 state
const [competitiveMode, setCompetitiveMode] = useState('solo');
const [teamName, setTeamName] = useState('');
const [suddenDeathActive, setSuddenDeathActive] = useState(false);
const [livesRemaining, setLivesRemaining] = useState(1);
```

### Sudden Death Elimination
```javascript
// In handleAnswer function
if (suddenDeathActive && !isCorrect) {
  setLivesRemaining(0);
  setScore(score + points);
  setShowRationale(true);
  
  setTimeout(() => {
    alert(`💀 SUDDEN DEATH ELIMINATION!...`);
    setGameState('summary');
  }, 2000);
  return; // Stops normal flow
}
```

### Score Metadata
```javascript
// Enhanced score submission
if (activeChapter.id === 'day-to-be-wrong') {
  scoreData.mode = competitiveMode;
  scoreData.escalationLevel = escalationLevel;
  scoreData.resourcesPreserved = Object.values(resources).reduce((a,b) => a+b, 0);
  
  if (competitiveMode === 'sudden-death') {
    scoreData.survived = livesRemaining > 0;
    scoreData.questionsSurvived = correctCount;
  }
}
```

### Category Filtering
```javascript
// In LeaderboardScreen
const getFilteredScores = () => {
  switch(categoryFilter) {
    case 'safest-unit':
      return filtered.sort((a, b) => a.escalationLevel - b.escalationLevel);
    case 'resource-master':
      return filtered.sort((a, b) => b.resourcesPreserved - a.resourcesPreserved);
    case 'sudden-death':
      return filtered.filter(s => s.survived === true);
  }
};
```

## Instructor Usage

### Classroom Competition Ideas

**1. Team Tournament**
- Divide class into teams of 3-4
- Each team gets 30 minutes to achieve best score
- Team with highest score wins
- Encourages collaboration

**2. Sudden Death Challenge**
- Optional extra credit
- Must survive all 5 questions
- Limited attempts (3 max)
- Creates excitement

**3. Category Champions**
- Award prizes for each leaderboard category
- "Safest Unit" = Clinical judgment award
- "Resource Master" = Strategic thinking award
- "Sudden Death" = Excellence award

**4. Progress Tracking**
- Week 1: Students play Solo mode
- Week 2: Team battles begin
- Week 3: Sudden Death attempts (optional)
- Shows progression

### Discussion Points

**After Team Mode**:
- "How did your team coordinate decisions?"
- "What strategies did successful teams use?"
- "How is teamwork like real nursing units?"

**After Sudden Death**:
- "How did the pressure affect your thinking?"
- "What's different about zero tolerance for errors?"
- "Where in nursing is this level of precision required?"

**Leaderboard Analysis**:
- "Why did Safest Unit winners avoid escalations?"
- "How did Resource Masters preserve tools?"
- "What separates Sudden Death survivors?"

## Metrics to Track

### Student Engagement
- **Mode popularity**: Which mode do students choose most?
- **Replay rate**: Do students retry Sudden Death?
- **Team participation**: How many unique team names?
- **Category competition**: Which leaderboard is most competitive?

### Learning Outcomes
- **Improvement over time**: Do Sudden Death attempts improve?
- **Resource efficiency**: Are players getting better at preservation?
- **Escalation reduction**: Fewer crises with practice?

### Competitive Dynamics
- **Team vs Solo**: Do teams score higher?
- **Sudden Death success rate**: What % survive?
- **Category distribution**: Are same players dominating all categories?

## Future Enhancements (Phase 4?)

Potential additions:
- [ ] Live team vs team races (real-time)
- [ ] Tournament bracket generation
- [ ] Team chat/coordination
- [ ] Replays and spectator mode
- [ ] Seasonal leaderboard resets
- [ ] Achievement badges
- [ ] Player profiles with stats

---
**Status**: Phase 3 Complete ✅  
**Deployed**: https://bgibson-mectc.github.io/Term-3-Gaming  
**Build**: main.29c09d1c.js  
**Date**: January 7, 2026

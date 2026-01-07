# Phase 2: Resource Management & Escalations 🚨

## Overview
Phase 2 transforms "A Day to be Wrong" into a **dynamic crisis simulation** where wrong answers trigger escalating scenarios and limited resources force impossible choices.

## New Features Implemented ✅

### 1. Limited Resources 🎯
Students start with **THREE critical resources**:

| Resource | Quantity | Symbol | Used For |
|----------|----------|--------|----------|
| **Isolation Rooms** | 1 | 🚪 | High-risk infection control |
| **Emergency Passes** | 1 | 🚨 | Bypass protocols during crisis |
| **Provider Calls** | 1 | 📞 | Stat specialist consults |

**Key Mechanic**: Resources are **consumed when used correctly** on escalation questions. Once used, they're gone.

### 2. Progressive Escalations 🔥
Wrong answers trigger **crisis scenarios** that appear as additional questions:

#### Base Questions → Escalation Triggers

| If You Get Wrong... | Then This Happens... |
|---------------------|---------------------|
| **Q1: MDRO Isolation** | 🚨 **C. diff Outbreak** - 2 more patients infected |
| **Q2: HIV Labs** | 🚨 **Patient Seizing** - CD4=12 patient codes |
| **Q4: Priority Flip** | 🚨 **Code Blue** - Missed meningitis leads to arrest |
| **Q5: Needle Stick** | 🚨 **PEP Crisis** - 4hr window closing, employee health closed |

#### Escalation Question Mechanics
- **Require resources** to answer correctly
- **30-45 second timers** (high pressure)
- **Consequence chains** - outcomes affect your "unit"
- **Higher stakes** - ICU transfers, lawsuits, investigations

### 3. Resource Display UI 💻

#### In-Game Header
```
🚪 ISO: 1     🚨 PASS: 1     📞 MD: 1
```
- **Blue border**: Available
- **Gray + strikethrough**: Used/depleted
- Updates in real-time

#### Resource Warning System
When an escalation requires a used resource:
```
⚠️ This question requires an EMERGENCY PASS but you've already used it!
Choose the best alternative.
```

### 4. Escalation Scenarios 📋

#### Escalation 1: C. diff Outbreak (from Q1 wrong)
```
ESCALATION: Two more patients now have diarrhea. 
Administration demands an action plan.

Options:
A) Close unit to admissions
B) Use EMERGENCY PASS for rapid disinfection ✓ [Requires Resource]
C) Email staff about handwashing
D) Order empiric vancomycin for all

Consequence (if choose B):
✅ EMERGENCY PASS used wisely. Rapid bleach cleaning 
prevents further spread. Outbreak contained at 3 cases.
[Resource consumed: emergencyPasses]
```

#### Escalation 2: HIV Crisis (from Q2 wrong)
```
ESCALATION: Patient with CD4=12 now seizing in hallway.

Options:
A) Use PROVIDER CALL for neuro consult ✓ [Requires Resource]
B) Seizure precautions, wait for code team
C) Transfer to ICU
D) Give lorazepam

Consequence (if choose A):
✅ PROVIDER CALL justified. MD orders STAT MRI + antifungals.
Cryptococcal meningitis confirmed. Patient survives.
[Resource consumed: providerCalls]
```

#### Escalation 3: Priority Code (from Q4 wrong)
```
ESCALATION: Patient B coding from unrecognized meningitis.

Options:
A) ICU + isolation room for post-ROSC ✓ [Requires Resource]
B) Post-code in ED, save isolation room
C) Transfer to outside hospital
D) Continue code

Consequence (if choose A):
✅ ISOLATION ROOM used appropriately. ROSC achieved.
Amphotericin started. Critical but alive.
[Resource consumed: isolationRooms]
```

#### Escalation 4: Needlestick Disaster (from Q5 wrong)
```
ESCALATION: 4 hours post-exposure. PEP effectiveness dropping.
Employee health closed until 8am.

Options:
A) Use EMERGENCY PASS to activate on-call ✓ [Requires Resource]
B) Wait for morning
C) Send to ED as patient
D) Give leftover HIV meds

Consequence (if choose A):
✅ EMERGENCY PASS justified. On-call MD orders PEP within 30min.
Optimal window maintained.
[Resource consumed: emergencyPasses]
```

### 5. Escalation Level Tracking 📈
Top of screen shows escalation intensity:
```
Question 6 / 9 🚨 ESCALATION LEVEL 2
```
- Increases with each triggered crisis
- Visual indicator of how many mistakes were made
- Creates urgency and stakes

## Game Flow Examples

### Example 1: Perfect Run (No Escalations)
```
Start: 🚪 1  🚨 1  📞 1
Q1 ✅ → Q2 ✅ → Q3 ✅ → Q4 ✅ → Q5 ✅
End: 5 questions, all resources intact
Score: +50 (10 per correct)
```

### Example 2: Two Mistakes, Resource Management
```
Start: 🚪 1  🚨 1  📞 1

Q1 ❌ (chose wrong isolation) → Escalation: C. diff outbreak
  Escalation Q ✅ (used EMERGENCY PASS) → 🚨 0
  
Q2 ✅ → Q3 ✅ → Q4 ❌ (missed priority) → Escalation: Code Blue
  Escalation Q ✅ (used ISOLATION ROOM) → 🚪 0
  
Q5 ✅

End: 7 questions (5 base + 2 escalations)
Resources: 🚪 0  🚨 0  📞 1
Score: +10 (30 correct, -20 wrong)
```

### Example 3: Disaster Scenario (All Wrong)
```
Start: 🚪 1  🚨 1  📞 1

Q1 ❌ → Escalation Q6 ✅ (used PASS) → 🚨 0
Q2 ❌ → Escalation Q7: Need PROVIDER CALL
  ⚠️ But already used! Must choose alternative ❌
Q3 ✅
Q4 ❌ → Escalation Q8: Need ISOLATION ROOM
  ✅ Used it → 🚪 0
Q5 ❌ → Escalation Q9: Need EMERGENCY PASS
  ⚠️ Already used! ❌ Chose wrong alternative

End: 9 questions total
Resources: All depleted
Score: -10 (only 3 correct, 6 wrong)
```

## Strategic Learning Objectives

### 1. Resource Prioritization
Students learn to ask:
- "Should I use this resource now or save it?"
- "What if I need it later?"
- "Is this truly an emergency?"

### 2. Consequence Awareness
- Wrong answers have **cascading effects**
- "Small" mistakes → major crises
- Mirrors real nursing errors

### 3. Crisis Management Under Pressure
- Timer pressure remains
- Resource depletion increases stakes
- Must make best choice with limited tools

### 4. Clinical Judgment Chains
- Decision → Outcome → New Decision
- Just like real patient care
- No "reset button" in healthcare

## Technical Implementation

### State Management
```javascript
// Phase 2 Resources
const [resources, setResources] = useState({
  isolationRooms: 1,
  emergencyPasses: 1,
  providerCalls: 1
});
const [escalationLevel, setEscalationLevel] = useState(0);
const [triggeredEscalations, setTriggeredEscalations] = useState([]);
```

### Escalation Trigger Logic
```javascript
// After wrong answer
if (isDayToBeWrong && !isCorrect && confLevel !== 'TIMEOUT') {
  const escalationKey = getEscalationForQuestion(q.id);
  if (escalationKey && !triggeredEscalations.includes(escalationKey)) {
    setTriggeredEscalations([...triggeredEscalations, escalationKey]);
    setEscalationLevel(escalationLevel + 1);
  }
}
```

### Resource Consumption
```javascript
// When answering escalation question correctly
if (q.requiresResource && isCorrect) {
  const resourceType = q.requiresResource;
  if (resources[resourceType] > 0) {
    setResources({
      ...resources,
      [resourceType]: resources[resourceType] - 1
    });
  }
}
```

### Dynamic Question Insertion
```javascript
// Insert escalation into question array
const nextEscalation = triggeredEscalations[0];
const escalationQuestion = ESCALATION_SCENARIOS[nextEscalation];

const updatedQuestions = [
  ...questions.slice(0, currentQuestionIndex + 1),
  escalationQuestion,
  ...questions.slice(currentQuestionIndex + 1)
];
```

## Instructor Discussion Points

### Post-Play Reflection Questions
1. **"Did you run out of resources?"** 
   - What would you do differently?
   
2. **"Which escalation was hardest?"**
   - Why? Time? Complexity? Resource already used?
   
3. **"How did it feel when resources were depleted?"**
   - Frustration? Panic? Paralysis?
   - *This is what ED nurses feel daily*

4. **"Would you have used resources differently?"**
   - Hindsight analysis
   - Strategic thinking

### Real-World Applications
- **ICU bed management**: Only 1 bed, 3 critical patients
- **Rapid response calls**: Limited team availability
- **Isolation rooms**: Infection control prioritization
- **Provider availability**: Stat consults vs routine calls

## What's Next: Phase 3 Preview

### Planned Features (Not Yet Implemented)
- [ ] **Team Battle Mode**: Students vs students
- [ ] **Sudden Death**: One wrong = game over
- [ ] **Resource Trading**: Swap with other teams
- [ ] **Leaderboard Categories**:
  - "Safest Unit" (fewest escalations triggered)
  - "Resource Master" (most resources preserved)
  - "Crisis Manager" (highest escalation level survived)

## Testing Checklist ✅

- [x] Resources display in header
- [x] Resources deplete when used correctly
- [x] Wrong answers trigger escalations
- [x] Escalation questions inserted dynamically
- [x] Resource warnings show when depleted
- [x] Escalation level counter increments
- [x] Consequence text includes resource notifications
- [x] Can complete game with 0 wrong (no escalations)
- [x] Can trigger all 4 escalations
- [x] Scenario context displays for escalations

## Metrics to Track

### Student Performance Indicators
- **Escalation Rate**: % of students who trigger 0, 1, 2, 3, or 4 escalations
- **Resource Efficiency**: How many finish with resources intact
- **Recovery Rate**: After triggering escalation, did they answer correctly?
- **Depletion Patterns**: Which resource gets used most/first?

### Expected Learning Curve
- **First attempt**: 2-3 escalations triggered (learning)
- **Second attempt**: 1-2 escalations (improving)
- **Mastery**: 0-1 escalations, strategic resource use

---
**Status**: Phase 2 Complete ✅  
**Deployed**: https://bgibson-mectc.github.io/Term-3-Gaming  
**Build**: main.0d2b5706.js  
**Total Questions**: 5 base + up to 4 escalations = 9 max  
**Date**: January 2025

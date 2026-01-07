# 🎨 Least Dangerous Mode - UI Preview

## Mode Card Appearance

When students click **"🎯 Practice Modes"**, they'll see:

```
┌─────────────────────────────────────────────────────────┐
│  🎯 PRACTICE MODES                                       │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│  ⚠️  🔔                  │  │  🎯  🎯                  │
│  Exam Traps              │  │  Priority First          │
│  Med safety & teaching   │  │  ABC, Maslow, Safety     │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│  🧪  🧫                  │  │  🔢  📋                  │
│  Labs & Diagnostics      │  │  Sequencing Master       │
│  Lab interpretation      │  │  Order matters           │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│  🛡️  🔒                  │  │  👑  👑                  │
│  Barrier Bootcamp        │  │  Boss Fight              │
│  First-line defenses     │  │  10 curated hard-hitters │
└──────────────────────────┘  └──────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                                                         │
│  ⚖️  ⚖️                                                 │
│                                                         │
│  Least Dangerous                                        │
│                                                         │
│  🔥🔥🔥🔥🔥 Every answer is wrong - pick the           │
│  least dangerous risk                                   │
│                                                         │
│  [Red → Orange → Yellow gradient background]           │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Distinctive Visual Features

### Color Scheme
- **Gradient:** `from-red-600 via-orange-600 to-yellow-500`
- **Meaning:** Danger colors (red/orange/yellow) signal high stakes
- **Effect:** Stands out from other modes

### Icons
- **Main:** ⚖️ (Balance scale - symbolizes weighing risks)
- **Secondary:** ⚖️ (Scale from lucide-react library)
- **Meaning:** Balance/judgment between competing options

### Difficulty Indicator
- **Display:** 🔥🔥🔥🔥🔥 (5 flames)
- **Meaning:** Maximum difficulty
- **Unique:** Only mode with 5-flame rating

### Description
> "Every answer is wrong - pick the least dangerous risk"

**This immediately signals:**
- Not a traditional quiz
- Requires different thinking
- High-level clinical judgment

---

## Question Display Format

When a scenario loads:

```
┌─────────────────────────────────────────────────────────┐
│  ⚖️ Least Dangerous • Question 1/5             45:00    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  You are charge nurse. One negative-pressure room       │
│  available. Three patients arrive simultaneously.       │
│                                                          │
│  Patient A                                              │
│  Watery diarrhea ×6 hours • Recent clindamycin • No    │
│  stool results yet                                      │
│                                                          │
│  Patient B                                              │
│  Ventilated ICU transfer • Fever 39°C • Prior CRE      │
│  infection                                              │
│                                                          │
│  Patient C                                              │
│  MRSA colonized • Large draining wound •                │
│  Immunocompromised roommate assigned                    │
│                                                          │
│  👉 Who gets the negative-pressure room — and why?     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ○  Patient A - suspected C. diff needs negative        │
│     pressure                                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ○  Patient B - CRE has highest mortality risk          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ○  Patient C - MRSA drainage poses infection risk to   │
│     immunocompromised roommate                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ○  Rotate them every 8 hours to share the resource     │
│     equally                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  💡 EXAM TIP: Negative-pressure rooms are for AIRBORNE  │
│  precautions (TB, measles, varicella). None of these    │
│  patients technically need it, but you must choose who  │
│  benefits most from isolation.                          │
└─────────────────────────────────────────────────────────┘
```

---

## After Answer Submission

```
┌─────────────────────────────────────────────────────────┐
│  ✅ CORRECT - Good clinical judgment!                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📖 RATIONALE                                           │
│                                                          │
│  Best choice: Patient C (though still not ideal)        │
│                                                          │
│  Why C is least dangerous:                              │
│  • MRSA + draining wound + immunocompromised roommate   │
│    = HIGH transmission risk                             │
│  • Prevents transmission to vulnerable patient          │
│  • Contact precautions can be enforced                  │
│                                                          │
│  Why the others are worse:                              │
│                                                          │
│  Patient A (C. diff):                                   │
│  • C. diff needs CONTACT precautions + soap/water, NOT  │
│    negative pressure                                    │
│  • Negative pressure is wasted on this patient          │
│  • Can be managed in regular room with proper           │
│    handwashing                                          │
│                                                          │
│  Patient B (CRE):                                       │
│  • CRE is a mortality risk but NOT airborne             │
│  • Contact precautions are sufficient                   │
│  • Negative pressure doesn't add protection value       │
│                                                          │
│  Patient D (rotation):                                  │
│  • Resource allocation based on need, not equality      │
│  • Increases transmission risk by moving infected       │
│    patients                                             │
│  • Logistically impossible and clinically unsound       │
│                                                          │
│  🎯 NCLEX Teaching Point:                               │
│  "NCLEX doesn't test what's right. It tests whether     │
│  you can explain why the others are worse."             │
│                                                          │
│  ⚠️ NOTE: In reality, none of these patients need      │
│  negative pressure for their conditions. This tests     │
│  resource allocation under imperfect circumstances.     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│             [NEXT QUESTION →]                            │
└─────────────────────────────────────────────────────────┘
```

---

## Game Summary Screen

After all 5 scenarios:

```
┌─────────────────────────────────────────────────────────┐
│  🏆 CLINICAL JUDGMENT ASSESSMENT COMPLETE                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Your Score: 4/5 (80%)                                  │
│                                                          │
│  Scenarios Completed:                                   │
│  ✅ MDRO Moral Injury                                   │
│  ✅ HIV - When Labs Lie                                 │
│  ❌ The SATA from Hell                                  │
│  ✅ Priority Flip                                       │
│  ✅ Needle Stick - Time Trap                            │
│                                                          │
│  Clinical Judgment Skills:                              │
│  • Resource Allocation: STRONG                          │
│  • Lab Interpretation: STRONG                           │
│  • Priority Setting: STRONG                             │
│  • Prevention Knowledge: NEEDS REVIEW                   │
│  • Time Management: STRONG                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  💭 Remember:                                           │
│  "There is no perfect answer in nursing. Success is     │
│  choosing the least dangerous risk and being able to    │
│  justify why."                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [REVIEW SCENARIOS]  [RETURN TO MENU]  [PLAY AGAIN]    │
└─────────────────────────────────────────────────────────┘
```

---

## Mobile View

On smaller screens, mode cards stack vertically:

```
┌────────────────────────┐
│  ⚖️  ⚖️                │
│                        │
│  Least Dangerous       │
│                        │
│  🔥🔥🔥🔥🔥            │
│                        │
│  Every answer is wrong │
│  - pick the least      │
│  dangerous risk        │
│                        │
│  [Red → Orange →       │
│   Yellow gradient]     │
└────────────────────────┘
```

---

## Accessibility Features

- **High Contrast:** Red-orange-yellow gradient ensures visibility
- **Clear Icons:** Scale symbol universally recognized
- **Descriptive Text:** Mode purpose clearly stated
- **Difficulty Rating:** Visual indicator (flames) + text
- **Keyboard Navigation:** All buttons accessible via keyboard
- **Screen Readers:** Proper ARIA labels and semantic HTML

---

## Comparison with Other Modes

| Mode | Icon | Color | Difficulty | Focus |
|------|------|-------|------------|-------|
| Exam Traps | ⚠️ | Red-Orange | Varies | Med safety |
| Priority First | 🎯 | Purple-Pink | Varies | ABC/Maslow |
| Boss Fight | 👑 | Purple-Indigo | High | Mixed hard |
| **Least Dangerous** | **⚖️** | **Red-Orange-Yellow** | **🔥×5** | **Judgment** |

**Least Dangerous stands out because:**
- Only mode with explicit "no right answer" message
- Maximum difficulty (5 flames)
- Unique color scheme (danger gradient)
- Justice/balance icon (not combat/test icon)

---

## User Experience Flow

```
Main Menu
    ↓
[🎯 Practice Modes] ← Click
    ↓
Mode Selector Screen
    ↓
[⚖️ Least Dangerous] ← Click
    ↓
Scenario 1 loads
    ↓
Student selects answer
    ↓
Detailed rationale shows
    ↓
[Next Question →]
    ↓
Repeat for 5 scenarios
    ↓
Summary Screen
    ↓
[Return to Menu] or [Play Again]
```

---

## First-Time User Experience

When a student clicks this mode for the first time:

1. **Visual Impact:** Danger-colored gradient catches attention
2. **Difficulty Indicator:** 5 flames signal "this is serious"
3. **Description Hook:** "Every answer is wrong" creates intrigue
4. **Mental Preparation:** Sets expectation for different type of thinking

**This primes students for:**
- Critical thinking over recall
- Risk assessment mindset
- Comfort with ambiguity
- Justification-focused approach

---

## Instructor View

Instructors can:
- ✅ See the mode in Practice Modes list
- ✅ Access it like any other mode
- ✅ Review all scenarios and rationales
- ✅ Use in classroom or assign for homework
- ✅ Track student performance (if analytics enabled)

**No special instructor controls needed** - mode integrates seamlessly with existing game infrastructure.

---

## Visual Branding

The **Least Dangerous** mode has consistent branding:

**Symbol:** ⚖️ (Balance Scale)
- Represents weighing options
- Justice/judgment connotation
- Neutral (not aggressive or passive)

**Color:** Red → Orange → Yellow
- Danger/warning colors
- High-stakes feeling
- Attention-grabbing

**Difficulty:** 🔥🔥🔥🔥🔥
- Maximum challenge
- Elite/advanced content
- Badge of honor for completion

**Tagline:** "Every answer is wrong"
- Memorable
- Sets expectations
- Creates curiosity

---

This visual design ensures students **immediately recognize** this is not a typical quiz, preparing them mentally for the type of critical thinking required.

**"There is no perfect answer."** ⚖️

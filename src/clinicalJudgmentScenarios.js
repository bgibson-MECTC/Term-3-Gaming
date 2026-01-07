/**
 * LEAST DANGEROUS MODE - Clinical Judgment Scenarios (HARD MODE)
 * 
 * HARD MODE RULES:
 * ❌ 1. NO FULL INFORMATION - No complete vitals, labs, or diagnosis labels
 * ❌ 2. EVERY ANSWER HAS A COST - Each choice delays, worsens, or closes other options
 * ❌ 3. THE CORRECT ANSWER CHANGES - What was right 30 seconds ago may now be wrong
 * ❌ 4. SILENCE RULE - Some rounds require immediate answers with no discussion
 * 
 * REQUIRED: You must justify what you're sacrificing, not just what you're doing
 * 
 * Difficulty: 🔥🔥🔥🔥🔥
 * Time: 45–60 minutes
 * Group size: 3–4
 * Skill level: RN judgement, not recall
 */

export const CLINICAL_JUDGMENT_SCENARIOS = {
  id: 'day-to-be-wrong',
  title: '⚖️ A Day to be Wrong',
  icon: '⚖️',
  description: 'Every answer is wrong. Pick the least dangerous risk.',
  questions: [
    // ROUND 1: COMPETING PRIORITIES (HARD MODE - Incomplete Information)
    {
      id: "ld_q01_mdro_moral_injury",
      text: "🩸 COMPETING PRIORITIES: You are charge nurse. ONE negative-pressure room. THREE patients arrive. You must answer: (1) Where do you go FIRST? (2) What gets worse because of it?",
      scenario: `**Patient A:** "Feeling off" • Recent antibiotic • Some GI symptoms

**Patient B:** ICU transfer • "Fever" • History of resistant infection

**Patient C:** Known colonization • Wound actively draining • Roommate with "low immunity"

⚠️ NO FULL LABS • NO VITALS • NO DIAGNOSIS CONFIRMATION`,
      options: [
        "Patient A - Recent antibiotic + GI symptoms",
        "Patient B - ICU transfer with fever history",
        "Patient C - Draining wound + vulnerable roommate",
        "Try to share the room between patients"
      ],
      correctIndex: 2,
      timeLimit: 45,
      requiresConsequence: true,
      hardMode: true,
      evolutionTrigger: true, // Wrong answer evolves to escalation
      penalties: {
        wrong: -15, // Penalty for wrong choice
        delayed: -5, // Penalty if too slow
        secondaryHarm: -10 // Additional penalty for cascade effects
      },
      consequences: {
        0: "⚠️ **You chose A.** C. diff contained BUT: Immunocompromised patient now colonized with MRSA. Cost: One infection prevented, one created.",
        1: "⚠️ **You chose B.** CRE monitored BUT: C. diff now spreading. 3 patients in hallway exposed. Cost: Saved one, infected three.",
        2: "✓ **Least dangerous.** Immunocompromised protected BUT: You delayed CRE protocols. Cost: Best choice still has consequences.",
        3: "❌ **Unit disaster.** You tried to be fair. Cost: 2 cross-contaminated patients + 3 exposed staff + outbreak investigation."
      },
      costOfChoice: {
        description: "EVERY ANSWER HAS A COST. The game will track what you sacrificed.",
        trackSacrifices: true
      },
      rationale: `**Best choice: Patient C** (though still not ideal)

**SCORING:**
✓ Correct priority = +10 points
✓ Quick decision (< 30s) = +5 bonus
❌ Wrong choice = -15 points + secondary harm penalty
⏱️ Delayed decision = -5 points

**Why C is least dangerous:**
- MRSA + draining wound + immunocompromised roommate = HIGH transmission risk
- Prevents transmission to vulnerable patient
- Contact precautions can be enforced

**Why the others are worse:**

**Patient A (C. diff):**
- C. diff needs CONTACT precautions + soap/water, NOT negative pressure
- Negative pressure is wasted on this patient
- Can be managed in regular room with proper handwashing

**Patient B (CRE):**
- CRE is a mortality risk but NOT airborne
- Contact precautions are sufficient
- Negative pressure doesn't add protection value

**Patient D (rotation):**
- Resource allocation based on need, not equality
- Increases transmission risk by moving infected patients
- Logistically impossible and clinically unsound

**NCLEX Teaching Point:**
"NCLEX doesn't test what's right. It tests whether you can explain why the others are worse."

⚠️ **NOTE:** In reality, none of these patients need negative pressure for their conditions. This tests resource allocation under imperfect circumstances.`,
      skill: ["CLINICAL_JUDGMENT", "PRIORITY", "INFECTION_CONTROL"],
      concept: "RESOURCE_ALLOCATION",
      bloom: "EVALUATE",
      difficulty: 5,
      examTip: "Negative-pressure rooms are for AIRBORNE precautions (TB, measles, varicella). None of these patients technically need it, but you must choose who benefits most from isolation."
    },

    // ROUND 2: HIV — WHEN LABS LIE
    {
      id: "ld_q02_hiv_labs_lie",
      text: "HIV patient presents to clinic with the following data:",
      scenario: `**CD4:** 240
**Viral load:** Undetectable
**Symptoms:** New SOB, dry cough
**ART adherence:** "Pretty good"`,
      options: [
        "ART failure - patient is not adherent",
        "PCP pneumonia - CD4 near 200 with respiratory symptoms",
        "Anxiety - patient is worried about their diagnosis",
        "Medication side effects - ART can cause respiratory symptoms"
      ],
      correctIndex: 1,
      timeLimit: 60,
      hardMode: true,
      evolutionTrigger: true,
      penalties: {
        wrong: -20, // Higher penalty - life-threatening miss
        delayed: -10, // Respiratory emergency can't wait
        secondaryHarm: -15 // Patient deteriorates
      },
      consequences: {
        0: "❌ **Delayed diagnosis!** Viral load rebounds to 50,000 in 2 weeks. Patient was actually adherent.",
        1: "✅ **Life saved.** Started on Bactrim. Chest X-ray confirms PCP. Patient hospitalized but stable.",
        2: "❌ **Patient deteriorates.** Dismissed as anxiety. Now in ICU with respiratory failure. PCP diagnosis missed for 48 hours.",
        3: "❌ **Critical delay.** Respiratory symptoms worsened. Emergency intubation required. Should have suspected OI first."
      },
      rationale: `**Best choice: PCP pneumonia**

**Why PCP is the priority concern:**
- CD4 count 240 (near the critical 200 threshold for PCP risk)
- Classic PCP symptoms: SOB + dry cough
- PCP can develop even with undetectable viral load
- Life-threatening if not treated immediately

**Why the others are worse:**

**ART failure:**
- Viral load is UNDETECTABLE - ART is working
- "Pretty good" adherence is enough to maintain viral suppression
- Not the immediate concern

**Anxiety:**
- Dismisses potentially life-threatening symptoms
- Psychological symptoms don't cause SOB and dry cough
- Dangerous assumption

**Medication side effects:**
- While possible, respiratory symptoms are NOT common ART side effects
- Too risky to attribute serious symptoms to medications
- Must rule out infection first

**NCLEX Teaching Point:**
"Undetectable doesn't mean invincible. CD4 count determines opportunistic infection risk."

**Clinical Pearl:**
- Viral load = how well ART is working
- CD4 count = immune system strength and OI risk
- Symptoms OVERRIDE reassuring labs`,
      skill: ["CLINICAL_JUDGMENT", "LAB_INTERPRETATION", "PRIORITY"],
      concept: "HIV_COMPLICATIONS",
      bloom: "ANALYZE",
      difficulty: 5,
      examTip: "Viral load and CD4 count tell different stories. CD4 < 200 = PCP risk, regardless of viral suppression."
    },

    // ROUND 3: LEAST WRONG ANSWER (HARD MODE - Rank All 4 in Order of Urgency)
    {
      id: "ld_q03_ranking_priority",
      text: "⏱️ LEAST WRONG: Needlestick 90min ago. All 4 actions below are correct. Which prevents the MOST irreversible harm FIRST? (Choose highest priority only)",
      scenario: `**HIV+ Patient Post-Exposure:**
- Needlestick injury 90 minutes ago
- Source patient unknown status
- Employee terrified, no PEP started
- Window closing

⚠️ CHOOSE ONE - SEQUENCE DETERMINES OUTCOME`,
      options: [
        "Start PEP immediately - time-sensitive medication",
        "Obtain source patient labs first - need baseline data",
        "Provide emotional support - employee is panicking",
        "Complete incident documentation - required protocol"
      ],
      correctIndex: 0,
      timeLimit: 30,
      hardMode: true,
      evolutionTrigger: true,
      penalties: {
        wrong: -25, // Severe penalty - time-sensitive
        delayed: -15, // Every second counts
        secondaryHarm: -20 // PEP window closing
      },
      consequences: {
        0: "✅ **PEP started within window.** COST: Employee still anxious but protected. Could have been gentler.",
        1: "❌ **Labs ordered.** COST: PEP delayed 3 hours. Effectiveness dropped from 95% to 70%. Preventable risk.",
        2: "❌ **Employee calmed.** COST: PEP delayed 2 hours talking. Now only 50% effective. Feelings > survival?",
        3: "❌ **Documentation perfect.** COST: PEP started 4 hours late. Nearly useless now. Great paperwork, poor outcome."
      },
      rationale: `**Required actions: HIV test, Hepatitis B screening, Renal function labs, Condom counseling**

**Why each is required or not:**

✅ **HIV test** - REQUIRED
- Must confirm patient is HIV-negative before starting PrEP
- PrEP is for prevention, not treatment
- Starting PrEP on HIV+ patient causes resistance

✅ **Hepatitis B screening** - REQUIRED
- Tenofovir (in PrEP) treats HBV
- Stopping PrEP can cause HBV flare in infected patients
- Must know HBV status before starting

✅ **Renal function labs** - REQUIRED
- PrEP can cause kidney damage
- Need baseline creatinine/eGFR
- Monitor throughout treatment

❌ **CD4 count** - NOT required
- CD4 is for monitoring HIV disease progression
- Patient is HIV-negative (taking PrEP for prevention)
- This is the trap answer - sounds important but irrelevant

✅ **Condom counseling** - REQUIRED
- PrEP doesn't prevent other STIs
- Patient education on comprehensive prevention
- Required counseling component

❌ **ART resistance testing** - NOT required
- Resistance testing is for HIV+ patients on ART
- Not relevant for HIV-negative person on PrEP
- Another trap answer

**NCLEX Teaching Point:**
"Know what doesn't matter. Distinguish prevention vs treatment."

**Student Trap:**
Students pick CD4 because it "sounds important" for HIV. This tests understanding of WHEN tests are indicated.`,
      skill: ["CLINICAL_JUDGMENT", "TEACHING", "MED_SAFETY"],
      concept: "HIV_PREVENTION",
      bloom: "APPLY",
      difficulty: 5,
      examTip: "PrEP = Prevention for HIV-negative patients. CD4 count is only for HIV-positive patients. Don't get trapped by 'sounds important' answers."
    },

    // ROUND 4: PRIORITY FLIP (THIS ONE HURTS)
    {
      id: "ld_q04_priority_flip",
      text: "You have FOUR patients. Who do you see FIRST?",
      scenario: `**Patient A:** HIV, CD4 180 • Missed ART doses • No symptoms

**Patient B:** HIV, CD4 350 • Severe headache + photophobia

**Patient C:** HIV, CD4 90 • Stable, on prophylaxis

**Patient D:** HIV-negative partner asking about PrEP`,
      options: [
        "Patient A - lowest CD4 and non-adherent",
        "Patient B - neurological symptoms suggest CNS infection",
        "Patient C - CD4 90 is critically low",
        "Patient D - PrEP education is important for prevention"
      ],
      correctIndex: 1,
      timeLimit: 45,
      consequences: {
        0: "❌ **Patient B seizes in hallway!** Focused on labs instead of acute neuro symptoms. Now emergent intubation needed.",
        1: "✅ **Crisis averted.** LP shows cryptococcal meningitis. Amphotericin started. Patient stabilized in ICU.",
        2: "❌ **Patient B found unresponsive!** CD4 90 is chronic; acute neuro symptoms were the emergency. Delayed care = poor outcome.",
        3: "❌ **Patient B codes!** PrEP education can wait. Severe headache + photophobia = meningitis until proven otherwise."
      },
      rationale: `**Best choice: Patient B**

**Why Patient B is the priority:**
- Severe headache + photophobia = classic signs of meningitis
- CNS infection is IMMEDIATELY life-threatening
- CD4 350 is high enough for cryptococcal meningitis or toxoplasmosis
- Symptoms indicate CURRENT emergency

**Why the others are worse priorities:**

**Patient A (CD4 180, missed doses):**
- Low CD4 but NO symptoms = not immediate emergency
- ART adherence counseling is important but not urgent
- Can wait for acute patient

**Patient C (CD4 90):**
- Critically low CD4 BUT stable on prophylaxis
- No acute symptoms described
- Chronic management, not emergency

**Patient D (PrEP education):**
- Important preventive care
- NOT an emergency
- Can be scheduled/delayed

**NCLEX Teaching Point:**
"The sickest patient is not always the one with the worst labs."

**Priority Framework:**
1. **Acute symptoms** > Chronic labs
2. **Neurological changes** = emergency
3. **Stability** matters more than numbers

**Classic NCLEX Trap:**
Students reflexively choose "lowest CD4" without reading symptoms. This tests clinical judgment over numbers.`,
      skill: ["CLINICAL_JUDGMENT", "PRIORITY", "ASSESSMENT"],
      concept: "HIV_COMPLICATIONS",
      bloom: "EVALUATE",
      difficulty: 5,
      examTip: "Don't get distracted by the 'worst lab value'. Read the SYMPTOMS. Neuro changes = see first."
    },

    // ROUND 5: NEEDLE STICK — THE TIME TRAP
    {
      id: "ld_q05_needlestick_time",
      text: "Nurse reports a needle stick 2 hours ago but says: 'I wanted to finish my assignment first.' What is the MOST serious issue now?",
      options: [
        "Documentation delay - incident wasn't reported immediately",
        "Emotional distress - nurse needs psychological support",
        "Missed PEP window - time-sensitive intervention delayed",
        "Exposure severity - need to determine source patient's status"
      ],
      correctIndex: 2,
      timeLimit: 30,
      consequences: {
        0: "⚠️ **Documentation delayed but PEP started.** Better late than never, but golden window narrowing.",
        1: "❌ **Emotional support given.** But PEP window continues to close. Now 3+ hours post-exposure. Effectiveness dropping.",
        2: "✅ **PEP initiated immediately.** Started within ideal window despite delay. Source patient testing underway.",
        3: "❌ **Waiting for source labs!** PEP not started. Now 4+ hours post-exposure. Critical time wasted."
      },
      rationale: `**Best choice: Missed PEP window**

**Why PEP delay is the priority:**
- PEP (Post-Exposure Prophylaxis) must start within 72 hours (ideally <2 hours)
- Every hour of delay reduces effectiveness
- 2-hour delay is already significant
- Time-sensitive medication must be given NOW

**Why the others are less urgent:**

**Documentation delay:**
- Important for legal/tracking purposes
- But doesn't affect health outcome
- Can be done after PEP is started
- Not a clinical priority

**Emotional distress:**
- Valid concern
- But physical protection comes first
- Psychological support can follow
- ABCs before emotions

**Exposure severity:**
- Important to assess
- But PEP should start while investigating
- Don't delay treatment waiting for source patient labs
- Treatment is more urgent than diagnosis

**NCLEX Teaching Point:**
"NCLEX punishes delayed urgency. Time-sensitive interventions > investigation."

**PEP Window Rules:**
- Ideal: <2 hours
- Acceptable: <72 hours
- After 72 hours: Usually not effective

**Priority Order:**
1. Start PEP immediately
2. Test source patient
3. Document incident
4. Provide emotional support

**Student Trap:**
Students think "we need to know the source first" - NO. Start PEP while investigating.`,
      skill: ["CLINICAL_JUDGMENT", "PRIORITY", "MED_SAFETY"],
      concept: "OCCUPATIONAL_SAFETY",
      bloom: "EVALUATE",
      difficulty: 5,
      examTip: "Time-sensitive interventions can't wait for complete information. PEP now, investigate later."
    },

    // FINAL BOSS ROUND: DEFEND THE WRONG ANSWER (☠️ THIS IS WHERE IT GETS HARD)
    {
      id: "ld_q06_final_boss_defend_wrong",
      text: "☠️ FINAL BOSS: Defend the WRONG answer. Patient with 'low immunity' exposed to draining wound. You chose NOT to isolate them. Defend your choice.",
      scenario: `**What Happened:**
- You were charge nurse
- ONE isolation room available
- Patient C (draining MRSA wound) needed room
- Immunocompromised roommate was at risk
- You chose DIFFERENTLY

**NOW DEFEND IT:**

Infection control is demanding an explanation. Your manager is standing here. The family is asking questions.

⚠️ You must make a CLINICAL ARGUMENT for why NOT isolating was defensible, despite the obvious risk.`,
      options: [
        "Resource scarcity - other patients had higher mortality risk",
        "MRSA colonization vs infection - contact precautions sufficient",
        "Patient autonomy - roommate understood and accepted risk",
        "Cost-benefit analysis - isolation causes psychological harm"
      ],
      correctIndex: 1, // MRSA colonization argument is most defensible
      timeLimit: 90, // Longer - they need to think hard
      hardMode: true,
      finalBoss: true,
      requiresDefense: true,
      consequences: {
        0: "⚠️ **Defensible but weak.** Admin accepts 'higher mortality' reasoning. But family is filing complaint about transparency.",
        1: "✅ **Strongest defense.** MRSA colonization + proper contact precautions CAN be managed without isolation. Clinically sound.",
        2: "❌ **Ethical violation.** 'Patient understood risk' doesn't protect YOU from negligence. Informed consent ≠ adequate precautions.",
        3: "❌ **Admin rejects this.** Psychological harm doesn't override infection control. You're being reassigned pending investigation."
      },
      rationale: `**FINAL BOSS RULES: DEFEND THE WRONG ANSWER**

This round tests whether you can:
1. Recognize nuance in "wrong" decisions
2. Construct clinical arguments under pressure
3. Distinguish between wrong vs defensible

**Why Option B (MRSA colonization) is most defensible:**

- MRSA **colonization** ≠ active infection
- Contact precautions (gloves/gown) ARE evidence-based for colonization
- Isolation is for **airborne** or **droplet** spread
- Draining wound can be managed with proper technique

**Why the others fail:**

**A (Resource scarcity):**
- Legally risky - suggests you gambled with patient safety
- Admin might accept but family won't
- Opens you to malpractice claims

**C (Patient autonomy):**
- Informed consent doesn't absolve you of duty
- Immunocompromised patient can't truly "consent" to preventable infection
- This is ethically and legally indefensible

**D (Psychological harm):**
- Isolation has side effects BUT
- Infection control > psychological comfort
- This argument will get you reassigned

**THE LESSON:**
Even "wrong" answers have DEGREES of defensibility. The game forces you to think like a charge nurse under investigation.

**NCLEX Teaching Point:**
"There is no perfect answer, but some wrong answers are less wrong than others. Know which battles you can defend."`,
      skill: ["CLINICAL_JUDGMENT", "INFECTION_CONTROL", "ETHICS", "LEADERSHIP"],
      concept: "RESOURCE_ALLOCATION",
      bloom: "CREATE",
      difficulty: 5,
      examTip: "Final Boss tests meta-cognition: Can you defend an imperfect choice with clinical reasoning? This is charge nurse reality."
    }
  ]
};

// PHASE 2: ESCALATION SCENARIOS - Triggered by wrong answers
export const ESCALATION_SCENARIOS = {
  // Triggered if Q1 wrong (MDRO isolation) - C. diff outbreak
  cdiff_outbreak: {
    id: "ld_escalation_cdiff",
    text: "🚨 ESCALATION: Two more patients now have diarrhea. Administration demands an action plan. What do you do FIRST?",
    scenario: `**New Development:**
- Patients D & E: Acute watery diarrhea started 24h after ED visit
- Both were in hallway beds near Patient A
- Lab confirms: Patient A positive for C. diff
- Infection control called emergency meeting`,
    options: [
      "Close the unit to new admissions immediately",
      "Use your EMERGENCY PASS to get rapid cleaning/disinfection",
      "Send mass email to all staff about handwashing",
      "Call provider to order empiric vancomycin for all exposed patients"
    ],
    correctIndex: 1,
    timeLimit: 45,
    requiresResource: "emergencyPasses",
    consequences: {
      0: "❌ **Unit closed!** Administration furious. -20 beds = patients diverted. Your manager is now being questioned.",
      1: "✅ **EMERGENCY PASS used wisely.** Rapid bleach cleaning prevents further spread. Outbreak contained at 3 cases.",
      2: "❌ **Email ignored.** C. diff spores survive alcohol sanitizer. Six patients now infected.",
      3: "❌ **Provider refuses.** 'I'm not treating email notifications.' Outbreak continues. Seven cases by week end."
    },
    rationale: "Emergency passes exist for outbreaks. Rapid environmental disinfection (bleach) is the priority for C. diff spores. Closing units is administrative last resort.",
    skill: ["CLINICAL_JUDGMENT", "INFECTION_CONTROL"],
    bloom: "EVALUATE"
  },

  // Triggered if Q2 wrong (HIV labs) - Patient decompensates
  hiv_crisis: {
    id: "ld_escalation_hiv_crisis",
    text: "🚨 ESCALATION: Patient with CD4 count 12 now has seizures. You delayed care. What NOW?",
    scenario: `**Crisis:**
- Patient seizing in hallway
- No bed available in ICU
- You have ONE PROVIDER CALL available
- Code team is at another emergency`,
    options: [
      "Use PROVIDER CALL for emergency neurology consult",
      "Start seizure precautions and wait for code team",
      "Transfer to ICU immediately using your authority",
      "Give lorazepam and hope it stops"
    ],
    correctIndex: 0,
    timeLimit: 30,
    requiresResource: "providerCalls",
    consequences: {
      0: "✅ **PROVIDER CALL justified.** MD orders STAT MRI and antifungals. Cryptococcal meningitis confirmed. Patient survives with deficits.",
      1: "❌ **Patient falls during seizure.** Head injury. Now intubated. Family considering lawsuit.",
      2: "❌ **No ICU bed available!** Transfer request denied. Patient continues seizing. Permanent brain damage.",
      3: "❌ **Seizure stops... then recurs.** Lorazepam bought 20 minutes. Not enough. Patient codes."
    },
    rationale: "Provider calls are for emergencies. CD4 of 12 + seizures = life-threatening opportunistic infection needing immediate specialist intervention.",
    skill: ["CLINICAL_JUDGMENT", "NEURO_ASSESSMENT"],
    bloom: "EVALUATE"
  },

  // Triggered if Q4 wrong (Priority flip) - Patient B codes
  priority_code: {
    id: "ld_escalation_priority_code",
    text: "🚨 ESCALATION: Patient B is coding from unrecognized meningitis. Code team needs direction. What's your call?",
    scenario: `**Code Blue:**
- Patient B unresponsive, seizure → cardiac arrest
- Code team running ACLS
- You're charge nurse - they need post-ROSC plan
- One ISOLATION ROOM available for post-code care`,
    options: [
      "ICU admission, empiric antibiotics, isolation room for infection risk",
      "Post-code monitoring in ED, save isolation room",
      "Transfer to outside hospital with neuro-ICU",
      "Continue code - outcome poor with delayed treatment"
    ],
    correctIndex: 0,
    timeLimit: 30,
    requiresResource: "isolationRooms",
    consequences: {
      0: "✅ **ISOLATION ROOM used appropriately.** ROSC achieved. Amphotericin started. Critical but alive.",
      1: "❌ **Staff exposure!** Cryptococcal meningitis now exposed entire ED. Three nurses out sick. Public health investigating.",
      2: "❌ **Transfer denied.** 'Too unstable to move.' Patient dies during preparation. Medical examiner case.",
      3: "❌ **Code called.** Family devastated. Your initial priority error led here. Preventable death."
    },
    rationale: "Post-ROSC care for infectious meningitis requires isolation. Staff safety + patient care. This is when resources get used.",
    skill: ["CLINICAL_JUDGMENT", "CODE_MANAGEMENT"],
    bloom: "EVALUATE"
  },

  // Triggered if Q5 wrong (Needle stick) - PEP window closing
  needlestick_disaster: {
    id: "ld_escalation_needlestick",
    text: "🚨 ESCALATION: 4 hours post-exposure. PEP effectiveness dropping. Employee health closed. What now?",
    scenario: `**Critical Window:**
- Now 4 hours since needle stick
- Source patient: HIV+ (uncontrolled), HCV+, HBsAg unknown
- Employee health closed until 8am (4 more hours)
- You have one EMERGENCY PASS to override protocols`,
    options: [
      "Use EMERGENCY PASS - activate 24/7 occupational health on-call",
      "Wait for employee health in morning, document well",
      "Send RN to ED as 'patient' for PEP",
      "Give leftover HIV meds from pharmacy stock"
    ],
    correctIndex: 0,
    timeLimit: 30,
    requiresResource: "emergencyPasses",
    consequences: {
      0: "✅ **EMERGENCY PASS justified.** On-call MD orders PEP within 30 min. Optimal window maintained.",
      1: "❌ **8 hours total delay.** PEP effectiveness significantly reduced. RN's anxiety through the roof. Risk counseling fails.",
      2: "❌ **ED refuses.** 'This is occupational exposure, wrong department.' Now 6 hours delayed. Nurses' union filing grievance.",
      3: "❌ **Medication error report filed.** Wrong PEP regimen given. Now need correct meds + report incident. Trust destroyed."
    },
    rationale: "PEP works best within 2 hours. Emergency passes exist for staff safety emergencies. This is textbook appropriate use.",
    skill: ["CLINICAL_JUDGMENT", "OCCUPATIONAL_SAFETY"],
    bloom: "EVALUATE"
  }
};

/**
 * Export questions with proper enrichment tags
 */
export function getClinicalJudgmentQuestions() {
  return CLINICAL_JUDGMENT_SCENARIOS.questions.map(q => ({
    ...q,
    chapter: 'day-to-be-wrong',
    chapterId: 'day-to-be-wrong',
    // Mark all as clinical judgment questions
    skill: q.skill || ["CLINICAL_JUDGMENT"],
    bloom: q.bloom || "EVALUATE",
    difficulty: 5 // All are max difficulty
  }));
}

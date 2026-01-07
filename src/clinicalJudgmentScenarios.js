/**
 * LEAST DANGEROUS MODE - Clinical Judgment Scenarios
 * 
 * THE RULES:
 * - There is no perfect answer in this activity
 * - Every option has risk
 * - You are graded on which risk you choose to accept
 * - You must justify why the other risks are worse
 * 
 * Difficulty: 🔥🔥🔥🔥🔥
 * Time: 45–60 minutes
 * Group size: 3–4
 * Skill level: RN judgement, not recall
 */

export const CLINICAL_JUDGMENT_SCENARIOS = {
  id: 'least-dangerous',
  title: '⚖️ Least Dangerous - Clinical Judgment',
  icon: '⚖️',
  description: 'Every answer is wrong. Pick the least dangerous risk.',
  questions: [
    // ROUND 1: MDRO MORAL INJURY
    {
      id: "ld_q01_mdro_moral_injury",
      text: "You are charge nurse. One negative-pressure room available. Three patients arrive simultaneously.",
      scenario: `**Patient A:** Watery diarrhea ×6 hours • Recent clindamycin • No stool results yet

**Patient B:** Ventilated ICU transfer • Fever 39°C • Prior CRE infection

**Patient C:** MRSA colonized • Large draining wound • Immunocompromised roommate assigned`,
      options: [
        "Patient A - suspected C. diff needs negative pressure",
        "Patient B - CRE has highest mortality risk",
        "Patient C - MRSA drainage poses infection risk to immunocompromised roommate",
        "Rotate them every 8 hours to share the resource equally"
      ],
      correctIndex: 2,
      rationale: `**Best choice: Patient C** (though still not ideal)

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

    // ROUND 3: THE SATA FROM HELL
    {
      id: "ld_q03_sata_prep",
      text: "HIV patient starting PrEP (Pre-Exposure Prophylaxis). Which actions are REQUIRED before initiating PrEP? (Select ALL that apply - justify EACH)",
      options: [
        "HIV test",
        "Hepatitis B screening",
        "Renal function labs",
        "CD4 count",
        "Condom counseling",
        "ART resistance testing"
      ],
      correctIndex: [0, 1, 2, 4], // Multiple correct answers
      isMultiSelect: true,
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
    }
  ]
};

/**
 * Export questions with proper enrichment tags
 */
export function getClinicalJudgmentQuestions() {
  return CLINICAL_JUDGMENT_SCENARIOS.questions.map(q => ({
    ...q,
    chapter: 'least-dangerous',
    chapterId: 'least-dangerous',
    // Mark all as clinical judgment questions
    skill: q.skill || ["CLINICAL_JUDGMENT"],
    bloom: q.bloom || "EVALUATE",
    difficulty: 5 // All are max difficulty
  }));
}

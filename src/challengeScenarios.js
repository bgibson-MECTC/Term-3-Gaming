// Challenge Mode Scenarios: "Least Dangerous Game"
// Format optimized for team battles with challenge mechanics

export const challengeScenarios = [
  {
    id: "mdro_cd_01",
    title: "C. diff or just diarrhea?",
    prompt: "Pick the least dangerous FIRST action.",
    stem: "76-year-old from LTC. Loose stools x2 today. Completed clindamycin 9 days ago. Afebrile. Vitals stable.",
    choices: [
      "Obtain stool sample",
      "Start IV fluids",
      "Initiate contact precautions + soap & water",
      "Administer loperamide"
    ],
    correctIndex: 2,
    rationaleCorrect: "Suspected C. diff = isolate immediately + soap/water; do not wait for labs.",
    rationaleWrong: [
      "Labs can come after containment; test punishes delay.",
      "Fluids help the patient but do not protect the unit first.",
      "Correct.",
      "Antidiarrheals increase risk of toxic megacolon."
    ],
    consequenceIfWrong: "Diarrhea worsens → hypotension develops; secondary exposure occurs.",
    difficulty: 4,
    timerSeconds: 60
  },
  
  {
    id: "hiv_cd4_02",
    title: "CD4 count interpretation",
    prompt: "Which CD4 level is MOST dangerous right now?",
    stem: "Four HIV patients in clinic today. All on ART. Which needs immediate intervention?",
    choices: [
      "Patient A: CD4 = 12, viral load undetectable",
      "Patient B: CD4 = 180, viral load 45,000",
      "Patient C: CD4 = 520, viral load 180,000",
      "Patient D: CD4 = 350, viral load undetectable"
    ],
    correctIndex: 1,
    rationaleCorrect: "CD4 180 + high viral load = active replication. Medication failure. Adjust regimen immediately.",
    rationaleWrong: [
      "CD4 is critically low BUT viral suppression = treatment working. Monitor closely but not most urgent.",
      "Correct.",
      "CD4 is great; viral load spike may be temporary or medication adherence issue.",
      "Both values stable and improving. Routine follow-up."
    ],
    consequenceIfWrong: "Patient B develops PCP pneumonia within 2 weeks due to delayed intervention.",
    difficulty: 5,
    timerSeconds: 60
  },
  
  {
    id: "prep_risk_03",
    title: "PrEP candidacy assessment",
    prompt: "Select ALL who need PrEP discussion (SATA)",
    stem: "Which patients should be offered pre-exposure prophylaxis?",
    choices: [
      "22-year-old MSM with 3+ partners in past year",
      "35-year-old woman whose partner has HIV (undetectable)",
      "28-year-old injection drug user sharing needles",
      "41-year-old monogamous heterosexual couple (both negative)"
    ],
    correctIndex: [0, 2], // Multiple correct answers
    rationaleCorrect: "MSM with multiple partners + IDU sharing needles = high-risk behaviors requiring PrEP.",
    rationaleWrong: [
      "Correct - high-risk sexual behavior.",
      "Partner with undetectable HIV has zero transmission risk (U=U). PrEP unnecessary if truly undetectable.",
      "Correct - needle sharing is highest risk.",
      "Monogamous couple both negative = no indication for PrEP."
    ],
    consequenceIfWrong: "Patient D receives unnecessary PrEP prescription; patient B becomes infected due to partner's unreported viral blip.",
    difficulty: 6,
    timerSeconds: 90
  },
  
  {
    id: "priority_triage_04",
    title: "Four patients, one nurse",
    prompt: "Who do you assess FIRST?",
    stem: "You arrive on shift. Four patients need attention.",
    choices: [
      "Patient on droplet precautions requesting lunch tray",
      "New admission with suspected bacterial meningitis",
      "Post-op patient complaining of 6/10 incision pain",
      "Diabetic patient with blood sugar 250 mg/dL"
    ],
    correctIndex: 1,
    rationaleCorrect: "Bacterial meningitis = life-threatening. Immediate assessment and isolation before it spreads.",
    rationaleWrong: [
      "Can delegate to unlicensed staff; not urgent.",
      "Correct.",
      "Pain is expected post-op; can wait 15-20 minutes.",
      "Elevated but not critical; address after life-threatening situation."
    ],
    consequenceIfWrong: "Meningitis patient seizes due to increased ICP; staff exposed before isolation.",
    difficulty: 4,
    timerSeconds: 45
  },
  
  {
    id: "needlestick_pep_05",
    title: "Needlestick aftermath",
    prompt: "What is the FIRST priority?",
    stem: "You sustain needlestick from HIV+ patient (detectable viral load). Blood exposure confirmed.",
    choices: [
      "Wash site with soap & water",
      "Report to employee health immediately",
      "Draw baseline HIV test",
      "Squeeze puncture site to express blood"
    ],
    correctIndex: 0,
    rationaleCorrect: "Wash immediately reduces viral load at site. Do this FIRST, then report within 2 hours for PEP.",
    rationaleWrong: [
      "Correct.",
      "Important but do AFTER washing site. PEP must start within 72 hours (ideally <2 hours).",
      "Baseline testing comes after immediate decontamination.",
      "NEVER squeeze; increases tissue damage and viral exposure."
    ],
    consequenceIfWrong: "Delay in washing increases infection risk. Squeezing causes deeper tissue exposure.",
    difficulty: 5,
    timerSeconds: 30
  }
];

// Export single scenario getter for backward compatibility
export const getChallengeScenarios = () => challengeScenarios;

// Helper to convert to old format if needed
export const convertToClinicalJudgmentFormat = (scenario) => ({
  id: scenario.id,
  text: scenario.prompt,
  scenario: scenario.stem,
  options: scenario.choices,
  correctIndex: Array.isArray(scenario.correctIndex) ? scenario.correctIndex[0] : scenario.correctIndex,
  timeLimit: scenario.timerSeconds,
  rationale: scenario.rationaleCorrect,
  consequences: {
    incorrect: scenario.consequenceIfWrong
  }
});

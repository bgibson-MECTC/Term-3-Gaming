/* ==============================
   Challenge Mode Game Engine
   - No answers shown until REVEAL phase
   - Supports: submit, challenge, judge, reveal
   - Supports consequences + difficulty
   ============================== */

export const PHASES = Object.freeze({
  LOBBY: "LOBBY",
  QUESTION: "QUESTION",          // scenario visible, no one submitted yet
  ANSWER_LOCKED: "ANSWER_LOCKED",// at least one team submitted
  CHALLENGE: "CHALLENGE",        // challenge window open
  JUDGE: "JUDGE",                // instructor/judge selects outcome
  REVEAL: "REVEAL"               // show rationale + correct + consequences
});

export function sanitizeText(str) {
  // Removes stray template markers like **word** or **, and trims
  if (typeof str !== "string") return "";
  // Remove markdown bold markers **...**
  let s = str.replace(/\*\*(.*?)\*\*/g, "$1");
  // If you literally have stray ** with no closing pair:
  s = s.replace(/\*\*/g, "");
  return s.trim();
}

export function createChallengeGame({ teams = [], scenarios = [] } = {}) {
  if (!Array.isArray(teams) || teams.length < 2) {
    throw new Error("Challenge mode needs at least 2 teams.");
  }
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    throw new Error("No scenarios provided.");
  }

  const state = {
    phase: PHASES.LOBBY,
    round: 0,
    scenarioIndex: -1,
    teams: teams.map((t) => ({
      id: t.id,
      name: t.name,
      score: 0
    })),
    // Per-round data:
    currentScenario: null,
    submissions: {}, // teamId -> { choiceIndex, submittedAt }
    challenges: [],  // [{ challengerTeamId, targetTeamId, trapText, alternativeIndex, createdAt }]
    // Judge outcome cache:
    judgeDecision: null // { type: "CHALLENGE_SUCCESS"|"CHALLENGE_FAIL"|"NO_CHALLENGE"|"OVERRIDE", ... }
  };

  function getTeam(teamId) {
    const t = state.teams.find((x) => x.id === teamId);
    if (!t) throw new Error(`Unknown teamId: ${teamId}`);
    return t;
  }

  function nextScenario() {
    state.round += 1;
    state.scenarioIndex = (state.scenarioIndex + 1) % scenarios.length;

    const raw = scenarios[state.scenarioIndex];
    // IMPORTANT: sanitize display text
    const scenario = {
      ...raw,
      prompt: sanitizeText(raw.prompt),
      stem: sanitizeText(raw.stem),
      // sanitize choices too
      choices: (raw.choices || []).map((c) => sanitizeText(c))
    };

    state.currentScenario = scenario;
    state.submissions = {};
    state.challenges = [];
    state.judgeDecision = null;
    state.phase = PHASES.QUESTION;
    return snapshot();
  }

  function submitAnswer(teamId, choiceIndex) {
    if (![PHASES.QUESTION, PHASES.ANSWER_LOCKED].includes(state.phase)) {
      throw new Error(`Cannot submit during phase ${state.phase}`);
    }
    const scenario = state.currentScenario;
    if (!scenario) throw new Error("No active scenario.");
    if (typeof choiceIndex !== "number" || choiceIndex < 0 || choiceIndex >= scenario.choices.length) {
      throw new Error("Invalid choiceIndex.");
    }

    // Lock submission (no changing unless you want to allow edits)
    if (state.submissions[teamId]) {
      throw new Error("This team already submitted.");
    }

    state.submissions[teamId] = { choiceIndex, submittedAt: Date.now() };
    state.phase = PHASES.ANSWER_LOCKED;
    return snapshot();
  }

  function openChallengeWindow() {
    if (state.phase !== PHASES.ANSWER_LOCKED) {
      throw new Error("Challenge window can open only after at least one submission.");
    }
    state.phase = PHASES.CHALLENGE;
    return snapshot();
  }

  function challengeAnswer({ challengerTeamId, targetTeamId, trapText, alternativeIndex }) {
    if (state.phase !== PHASES.CHALLENGE) {
      throw new Error(`Cannot challenge during phase ${state.phase}`);
    }
    if (challengerTeamId === targetTeamId) {
      throw new Error("Cannot challenge your own team.");
    }
    if (!state.submissions[targetTeamId]) {
      throw new Error("Target team has not submitted.");
    }
    const scenario = state.currentScenario;
    if (!scenario) throw new Error("No active scenario.");

    const cleanTrap = sanitizeText(trapText);
    if (!cleanTrap || cleanTrap.length < 5) {
      throw new Error("Trap explanation is too short.");
    }
    if (
      typeof alternativeIndex !== "number" ||
      alternativeIndex < 0 ||
      alternativeIndex >= scenario.choices.length
    ) {
      throw new Error("Invalid alternativeIndex.");
    }

    // Optional: limit to 1 challenge per challenger or per target
    const already = state.challenges.find(
      (c) => c.challengerTeamId === challengerTeamId && c.targetTeamId === targetTeamId
    );
    if (already) throw new Error("This challenge already exists.");

    state.challenges.push({
      challengerTeamId,
      targetTeamId,
      trapText: cleanTrap,
      alternativeIndex,
      createdAt: Date.now()
    });

    return snapshot();
  }

  function lockChallenges() {
    if (state.phase !== PHASES.CHALLENGE) throw new Error("Not in challenge phase.");
    state.phase = PHASES.JUDGE;
    return snapshot();
  }

  /* Judge outcomes:
     - NO_CHALLENGE: no one challenged, proceed to reveal scoring
     - CHALLENGE_SUCCESS: challenger steals points from target
     - CHALLENGE_FAIL: challenger loses points, target keeps
     - OVERRIDE: instructor overrides scoring outcome explicitly
  */
  function judge({ type, challengerTeamId, targetTeamId, note = "" }) {
    if (state.phase !== PHASES.JUDGE) {
      throw new Error(`Cannot judge during phase ${state.phase}`);
    }
    state.judgeDecision = { type, challengerTeamId, targetTeamId, note: sanitizeText(note) };
    return snapshot();
  }

  function revealAndScore() {
    if (![PHASES.JUDGE, PHASES.ANSWER_LOCKED].includes(state.phase)) {
      throw new Error("Reveal allowed after judge, or after answer lock if you skip challenges.");
    }
    const scenario = state.currentScenario;
    if (!scenario) throw new Error("No active scenario.");

    // Default scoring settings (tweak!)
    const SCORE = {
      correct: 10,
      wrong: -10,
      challengeSuccess: 8,
      challengeFail: -5,
      correctButChallenged: 0 // optional: set to 0 if challenged successfully
    };

    // Score each submitted team based on correctness
    const correctIndex = scenario.correctIndex;
    const isCorrect = (teamId) => state.submissions[teamId]?.choiceIndex === correctIndex;

    // Apply base scoring
    for (const teamId of Object.keys(state.submissions)) {
      const t = getTeam(teamId);
      t.score += isCorrect(teamId) ? SCORE.correct : SCORE.wrong;
    }

    // Apply judge decision if any
    const jd = state.judgeDecision;

    if (jd?.type === "CHALLENGE_SUCCESS" && jd.challengerTeamId && jd.targetTeamId) {
      // challenger gains, target loses their "correct" benefit (optional)
      getTeam(jd.challengerTeamId).score += SCORE.challengeSuccess;

      // Optional: if target was correct, remove it (make them 0 for being challenged)
      const target = getTeam(jd.targetTeamId);
      if (state.submissions[jd.targetTeamId]) {
        const wasCorrect = isCorrect(jd.targetTeamId);
        if (wasCorrect) {
          // remove the +10 already applied, replace with 0 (or leave it and just add challenger points)
          target.score -= SCORE.correct;
          target.score += SCORE.correctButChallenged; // typically 0
        }
      }
    } else if (jd?.type === "CHALLENGE_FAIL" && jd.challengerTeamId) {
      getTeam(jd.challengerTeamId).score += SCORE.challengeFail;
    } else if (jd?.type === "OVERRIDE") {
      // You can implement custom override rules here if you want.
      // For now: do nothing; this is a placeholder.
    }

    state.phase = PHASES.REVEAL;

    // IMPORTANT: Only now should UI show: correct answer, rationale, consequences
    return snapshot({ allowReveal: true });
  }

  function snapshot({ allowReveal = false } = {}) {
    const scenario = state.currentScenario;

    // "Safe" scenario that never includes answer key unless allowReveal
    const safeScenario = scenario
      ? {
          id: scenario.id,
          title: scenario.title ? sanitizeText(scenario.title) : "",
          prompt: scenario.prompt,
          stem: scenario.stem,
          choices: scenario.choices,
          difficulty: scenario.difficulty ?? 1,
          timerSeconds: scenario.timerSeconds ?? 60,
          // Only reveal these after revealAndScore()
          ...(allowReveal
            ? {
                correctIndex: scenario.correctIndex,
                rationaleCorrect: sanitizeText(scenario.rationaleCorrect || ""),
                rationaleWrong: Array.isArray(scenario.rationaleWrong)
                  ? scenario.rationaleWrong.map(sanitizeText)
                  : [],
                consequenceIfWrong: sanitizeText(scenario.consequenceIfWrong || "")
              }
            : {})
        }
      : null;

    return {
      phase: state.phase,
      round: state.round,
      scenarioIndex: state.scenarioIndex,
      teams: state.teams.map((t) => ({ ...t })),
      currentScenario: safeScenario,
      submissions: { ...state.submissions }, // contains only chosen index, no correctness
      challenges: state.challenges.map((c) => ({ ...c })),
      judgeDecision: state.judgeDecision ? { ...state.judgeDecision } : null
    };
  }

  return {
    getState: () => snapshot({ allowReveal: state.phase === PHASES.REVEAL }),
    nextScenario,
    submitAnswer,
    openChallengeWindow,
    challengeAnswer,
    lockChallenges,
    judge,
    revealAndScore
  };
}

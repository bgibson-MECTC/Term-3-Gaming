// Modes Engine - Study Mode Definitions and Pool Building

// Mode Definitions
export const MODES = {
  CHAPTER_REVIEW: "CHAPTER_REVIEW",
  EXAM_TRAPS: "EXAM_TRAPS",
  PRIORITY_FIRST: "PRIORITY_FIRST",
  LABS_DIAGNOSTICS: "LABS_DIAGNOSTICS",
  SEQUENCING: "SEQUENCING",
  BARRIER_BOOTCAMP: "BARRIER_BOOTCAMP",
  MISSED_REMATCH: "MISSED_REMATCH",
  BOSS_FIGHT: "BOSS_FIGHT",
  LEAST_DANGEROUS: "LEAST_DANGEROUS",
};

// Mode Metadata for UI
export const MODE_INFO = {
  [MODES.CHAPTER_REVIEW]: {
    title: "Chapter Review",
    description: "Standard chapter study - all questions",
    icon: "📚",
    color: "from-blue-500 to-cyan-500",
  },
  [MODES.EXAM_TRAPS]: {
    title: "Exam Traps",
    description: "Med safety & teaching error questions",
    icon: "⚠️",
    color: "from-red-500 to-orange-500",
  },
  [MODES.PRIORITY_FIRST]: {
    title: "Priority First",
    description: "ABC, Maslow, Safety - NCLEX priority questions",
    icon: "🎯",
    color: "from-purple-500 to-pink-500",
  },
  [MODES.LABS_DIAGNOSTICS]: {
    title: "Labs & Diagnostics",
    description: "Lab interpretation and diagnostic test questions",
    icon: "🧪",
    color: "from-green-500 to-teal-500",
  },
  [MODES.SEQUENCING]: {
    title: "Sequencing Master",
    description: "Order matters - steps, procedures, priorities",
    icon: "🔢",
    color: "from-yellow-500 to-orange-500",
  },
  [MODES.BARRIER_BOOTCAMP]: {
    title: "Barrier Bootcamp",
    description: "First-line defenses and infection control",
    icon: "🛡️",
    color: "from-indigo-500 to-blue-500",
  },
  [MODES.MISSED_REMATCH]: {
    title: "Missed Rematch",
    description: "Re-attempt your previously missed questions",
    icon: "🔄",
    color: "from-pink-500 to-red-500",
  },
  [MODES.BOSS_FIGHT]: {
    title: "Boss Fight",
    description: "10 curated hard-hitters across all skills",
    icon: "👑",
    color: "from-purple-600 to-indigo-600",
  },
  [MODES.LEAST_DANGEROUS]: {
    title: "Least Dangerous",
    description: "🔥🔥🔥🔥🔥 Every answer is wrong - pick the least dangerous risk",
    icon: "⚖️",
    color: "from-red-600 via-orange-600 to-yellow-500",
  },
};

// Helper functions to check tags
function hasSkill(question, skillName) {
  return Array.isArray(question.skill) && question.skill.includes(skillName);
}

function hasConcept(question, conceptName) {
  return question.concept === conceptName;
}

/**
 * Builds question pool based on mode and filters
 * @param {Array} allQuestions - All enriched questions
 * @param {String} mode - Mode constant from MODES
 * @param {Object} options - { chapterId, missedIds }
 * @returns {Array} Filtered question pool
 */
export function getPool(allQuestions, mode, options = {}) {
  const { chapterId = null, missedIds = [] } = options;
  
  let pool = allQuestions;

  // Filter by chapter if specified
  if (chapterId) {
    pool = pool.filter(q => q.chapter === chapterId);
  }

  // Apply mode-specific filtering
  switch (mode) {
    case MODES.EXAM_TRAPS:
      return pool.filter(q => 
        hasSkill(q, "MED_SAFETY") || 
        hasSkill(q, "TEACHING_ERROR")
      );

    case MODES.PRIORITY_FIRST:
      return pool.filter(q => hasSkill(q, "PRIORITY"));

    case MODES.LABS_DIAGNOSTICS:
      return pool.filter(q => 
        hasSkill(q, "LAB_INTERPRETATION") || 
        hasConcept(q, "DIAGNOSTIC_TESTS")
      );

    case MODES.SEQUENCING:
      return pool.filter(q => hasSkill(q, "SEQUENCING"));

    case MODES.BARRIER_BOOTCAMP:
      return pool.filter(q => 
        hasConcept(q, "FIRST_LINE_DEFENSE") || 
        hasConcept(q, "BARRIERS") ||
        hasConcept(q, "INFECTION_CONTROL") ||
        hasSkill(q, "INFECTION_CONTROL")
      );

    case MODES.MISSED_REMATCH:
      return pool.filter(q => missedIds.includes(q.id));

    case MODES.BOSS_FIGHT:
      return buildBossFightPool(pool);

    case MODES.LEAST_DANGEROUS:
      return pool.filter(q => hasSkill(q, "CLINICAL_JUDGMENT"));

    case MODES.CHAPTER_REVIEW:
    default:
      return pool;
  }
}

/**
 * Randomly picks N items from array
 * @param {Array} list - Source array
 * @param {Number} n - Number to pick
 * @returns {Array} Random selection
 */
function pickN(list, n) {
  const copy = [...list];
  copy.sort(() => Math.random() - 0.5);
  return copy.slice(0, n);
}

/**
 * Builds curated 10-question Boss Fight from skill distribution
 * @param {Array} pool - Available questions
 * @returns {Array} 10 curated questions
 */
export function buildBossFightPool(pool) {
  const sequencing = pool.filter(q => hasSkill(q, "SEQUENCING"));
  const priority = pool.filter(q => hasSkill(q, "PRIORITY"));
  const labs = pool.filter(q => hasSkill(q, "LAB_INTERPRETATION"));
  const traps = pool.filter(q => 
    hasSkill(q, "TEACHING_ERROR") || 
    hasSkill(q, "MED_SAFETY")
  );
  const diff = pool.filter(q => hasSkill(q, "DIFFERENTIATION"));

  // Boss fight recipe: 1 seq, 2 priority, 2 labs, 3 traps, 2 diff
  const bossFight = [
    ...pickN(sequencing, 1),
    ...pickN(priority, 2),
    ...pickN(labs, 2),
    ...pickN(traps, 3),
    ...pickN(diff, 2),
  ];

  // Ensure exactly 10 questions, fill gaps if needed
  if (bossFight.length < 10) {
    const remaining = pool.filter(q => !bossFight.includes(q));
    bossFight.push(...pickN(remaining, 10 - bossFight.length));
  }

  return bossFight.slice(0, 10);
}

/**
 * Analyzes question pool and returns stats
 * @param {Array} pool - Question pool
 * @returns {Object} Statistics about the pool
 */
export function analyzePool(pool) {
  const skillCounts = {};
  const conceptCounts = {};
  const bloomCounts = {};

  pool.forEach(q => {
    // Count skills
    if (Array.isArray(q.skill)) {
      q.skill.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    }

    // Count concepts
    if (q.concept) {
      conceptCounts[q.concept] = (conceptCounts[q.concept] || 0) + 1;
    }

    // Count bloom levels
    if (q.bloom) {
      bloomCounts[q.bloom] = (bloomCounts[q.bloom] || 0) + 1;
    }
  });

  return {
    total: pool.length,
    skillCounts,
    conceptCounts,
    bloomCounts,
  };
}

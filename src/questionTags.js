// Question metadata tags for advanced filtering and analytics
// Format: "chapterID_qXX" maps to { concept, skill[], bloom }

export const questionTags = {
  // ===== CH 18: IMMUNE ASSESSMENT =====
  ch18_q01: { concept: "FIRST_LINE_DEFENSE", skill: ["DIFFERENTIATION", "TEACHING_ERROR"], bloom: "APPLICATION" },
  ch18_q02: { concept: "IMMUNE_ORGANS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q03: { concept: "LEUKOCYTES", skill: ["RECALL", "LAB_INTERPRETATION"], bloom: "KNOWLEDGE" },
  ch18_q04: { concept: "LEUKOCYTOSIS", skill: ["PRIORITY", "LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch18_q05: { concept: "IMMUNITY_TYPES", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch18_q06: { concept: "AGING_IMMUNITY", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch18_q07: { concept: "LAB_VALUES", skill: ["LAB_INTERPRETATION", "DIFFERENTIATION"], bloom: "APPLICATION" },
  ch18_q08: { concept: "IMMUNE_DEFICIENCY", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch18_q09: { concept: "IMMUNE_ORGANS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q10: { concept: "IMMUNOGLOBULINS", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch18_q11: { concept: "PHYSICAL_ASSESSMENT", skill: ["PRIORITY", "LAB_INTERPRETATION"], bloom: "ANALYSIS" },
  ch18_q12: { concept: "LAB_VALUES", skill: ["LAB_INTERPRETATION", "DIFFERENTIATION"], bloom: "APPLICATION" },
  ch18_q13: { concept: "NUTRITION", skill: ["TEACHING"], bloom: "APPLICATION" },
  ch18_q14: { concept: "IMMUNITY_TYPES", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q15: { concept: "INFLAMMATION", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q16: { concept: "IMMUNITY_TYPES", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch18_q17: { concept: "LEUKOCYTES", skill: ["PRIORITY", "LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch18_q18: { concept: "COMPLEMENT_SYSTEM", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q19: { concept: "IMMUNITY_TYPES", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q20: { concept: "PHYSICAL_ASSESSMENT", skill: ["PRIORITY", "LAB_INTERPRETATION"], bloom: "ANALYSIS" },
  ch18_q21: { concept: "LAB_VALUES", skill: ["PRIORITY", "LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch18_q22: { concept: "LEUKOCYTES", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch18_q23: { concept: "IMMUNOGLOBULINS", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch18_q24: { concept: "IMMUNE_RESPONSE", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch18_q25: { concept: "LEUKOCYTES", skill: ["RECALL"], bloom: "KNOWLEDGE" },

  // ===== CH 19: IMMUNE DISORDERS =====
  ch19_q01: { concept: "HYPERSENSITIVITY", skill: ["RECALL", "LAB_INTERPRETATION"], bloom: "KNOWLEDGE" },
  ch19_q02: { concept: "ALLERGIES", skill: ["TEACHING", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q03: { concept: "ANAPHYLAXIS", skill: ["PRIORITY", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q04: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q05: { concept: "AUTOIMMUNE", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch19_q06: { concept: "ANAPHYLAXIS", skill: ["PRIORITY", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q07: { concept: "HYPERSENSITIVITY", skill: ["LAB_INTERPRETATION", "DIFFERENTIATION"], bloom: "APPLICATION" },
  ch19_q08: { concept: "ANAPHYLAXIS", skill: ["PRIORITY", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q09: { concept: "AUTOIMMUNE", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch19_q10: { concept: "IMMUNE_DEFICIENCY", skill: ["PRIORITY", "MED_SAFETY", "TEACHING_ERROR"], bloom: "APPLICATION" },
  ch19_q11: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch19_q12: { concept: "ALLERGIES", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch19_q13: { concept: "ALLERGIES", skill: ["TEACHING", "TEACHING_ERROR"], bloom: "APPLICATION" },
  ch19_q14: { concept: "TRANSPLANT_REJECTION", skill: ["PRIORITY", "SEQUENCING"], bloom: "APPLICATION" },
  ch19_q15: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch19_q16: { concept: "ALLERGIES", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q17: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q18: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch19_q19: { concept: "AUTOIMMUNE", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch19_q20: { concept: "ANAPHYLAXIS", skill: ["PRIORITY", "MED_SAFETY", "SEQUENCING"], bloom: "APPLICATION" },
  ch19_q21: { concept: "IMMUNOSUPPRESSION", skill: ["MED_SAFETY", "LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch19_q22: { concept: "AUTOIMMUNE", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch19_q23: { concept: "TRANSPLANT_REJECTION", skill: ["SEQUENCING"], bloom: "COMPREHENSION" },
  ch19_q24: { concept: "ALLERGIES", skill: ["TEACHING", "MED_SAFETY"], bloom: "APPLICATION" },
  ch19_q25: { concept: "ALLERGIES", skill: ["TEACHING", "TEACHING_ERROR"], bloom: "APPLICATION" },

  // ===== CH 20: CONNECTIVE TISSUE =====
  ch20_q01: { concept: "OSTEOARTHRITIS", skill: ["PRIORITY"], bloom: "ANALYSIS" },
  ch20_q02: { concept: "LUPUS", skill: ["TEACHING"], bloom: "APPLICATION" },
  ch20_q03: { concept: "RHEUMATOID_ARTHRITIS", skill: ["DIFFERENTIATION"], bloom: "ANALYSIS" },
  ch20_q04: { concept: "GOUT", skill: ["MED_SAFETY", "DIFFERENTIATION"], bloom: "APPLICATION" },
  ch20_q05: { concept: "SCLERODERMA", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch20_q06: { concept: "GOUT", skill: ["TEACHING"], bloom: "APPLICATION" },
  ch20_q07: { concept: "IMMUNOSUPPRESSION", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  ch20_q08: { concept: "OSTEOARTHRITIS", skill: ["DIFFERENTIATION"], bloom: "APPLICATION" },
  ch20_q09: { concept: "FIBROMYALGIA", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch20_q10: { concept: "AUTOIMMUNE", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch20_q11: { concept: "LUPUS", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch20_q12: { concept: "SCLERODERMA", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch20_q13: { concept: "OSTEOARTHRITIS", skill: ["TEACHING"], bloom: "APPLICATION" },
  ch20_q14: { concept: "SCLERODERMA", skill: ["TEACHING", "TEACHING_ERROR"], bloom: "APPLICATION" },
  ch20_q15: { concept: "SURGICAL", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch20_q16: { concept: "RHEUMATOID_ARTHRITIS", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  ch20_q17: { concept: "RHEUMATOID_ARTHRITIS", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch20_q18: { concept: "IMMUNOSUPPRESSION", skill: ["TEACHING", "TEACHING_ERROR", "MED_SAFETY"], bloom: "APPLICATION" },
  ch20_q19: { concept: "GOUT", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch20_q20: { concept: "OSTEOARTHRITIS", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch20_q21: { concept: "GOUT", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  ch20_q22: { concept: "GOUT", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch20_q23: { concept: "OSTEOARTHRITIS", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch20_q24: { concept: "LUPUS", skill: ["TEACHING", "PRIORITY"], bloom: "APPLICATION" },
  ch20_q25: { concept: "RHEUMATOID_ARTHRITIS", skill: ["MED_SAFETY"], bloom: "APPLICATION" },

  // ===== CH 21: MDROs =====
  ch21_q01: { concept: "TRANSMISSION", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch21_q02: { concept: "TRANSMISSION", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch21_q03: { concept: "TRANSMISSION", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch21_q04: { concept: "INFECTION_CONTROL", skill: ["PRIORITY", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q05: { concept: "INFECTION_CONTROL", skill: ["PRIORITY", "TEACHING_ERROR"], bloom: "APPLICATION" },
  ch21_q06: { concept: "TRANSMISSION", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch21_q07: { concept: "INFECTION_CONTROL", skill: ["PRIORITY"], bloom: "ANALYSIS" },
  ch21_q08: { concept: "MDROS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch21_q09: { concept: "ANTIBIOTIC_STEWARDSHIP", skill: ["TEACHING"], bloom: "COMPREHENSION" },
  ch21_q10: { concept: "PPE", skill: ["SEQUENCING", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q11: { concept: "PPE", skill: ["SEQUENCING", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q12: { concept: "MDROS", skill: ["PRIORITY"], bloom: "COMPREHENSION" },
  ch21_q13: { concept: "INFECTION_CONTROL", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch21_q14: { concept: "INFECTION_CONTROL", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch21_q15: { concept: "INFECTION_CONTROL", skill: ["TEACHING"], bloom: "COMPREHENSION" },
  ch21_q16: { concept: "TRANSMISSION", skill: ["DIFFERENTIATION", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q17: { concept: "PPE", skill: ["SEQUENCING", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q18: { concept: "TRANSMISSION", skill: ["DIFFERENTIATION", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q19: { concept: "MDROS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch21_q20: { concept: "INFECTION_CONTROL", skill: ["RECALL", "MED_SAFETY"], bloom: "KNOWLEDGE" },
  ch21_q21: { concept: "MDROS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch21_q22: { concept: "INFECTION_CONTROL", skill: ["DIFFERENTIATION", "MED_SAFETY"], bloom: "APPLICATION" },
  ch21_q23: { concept: "INFECTION_CONTROL", skill: ["PRIORITY", "SEQUENCING"], bloom: "APPLICATION" },
  ch21_q24: { concept: "ANTIBIOTIC_STEWARDSHIP", skill: ["TEACHING"], bloom: "COMPREHENSION" },
  ch21_q25: { concept: "INFECTION_CONTROL", skill: ["DIFFERENTIATION", "PRIORITY"], bloom: "APPLICATION" },

  // ===== CH 22: HIV/AIDS =====
  ch22_q01: { concept: "HIV_PROGRESSION", skill: ["SEQUENCING"], bloom: "COMPREHENSION" },
  ch22_q02: { concept: "HIV_PROGRESSION", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch22_q03: { concept: "HIV_PREVENTION", skill: ["TEACHING"], bloom: "APPLICATION" },
  ch22_q04: { concept: "HIV_PROGRESSION", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch22_q05: { concept: "OPPORTUNISTIC_INFECTIONS", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch22_q06: { concept: "HIV_TREATMENT", skill: ["TEACHING"], bloom: "COMPREHENSION" },
  ch22_q07: { concept: "OPPORTUNISTIC_INFECTIONS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch22_q08: { concept: "HIV_PREVENTION", skill: ["PRIORITY", "SEQUENCING"], bloom: "APPLICATION" },
  ch22_q09: { concept: "HIV_TREATMENT", skill: ["TEACHING", "TEACHING_ERROR"], bloom: "APPLICATION" },
  ch22_q10: { concept: "OPPORTUNISTIC_INFECTIONS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  ch22_q11: { concept: "HIV_DIAGNOSIS", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  ch22_q12: { concept: "HIV_TREATMENT", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch22_q13: { concept: "HIV_TRANSMISSION", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch22_q14: { concept: "HIV_TREATMENT", skill: ["TEACHING", "TEACHING_ERROR", "MED_SAFETY"], bloom: "APPLICATION" },
  ch22_q15: { concept: "OPPORTUNISTIC_INFECTIONS", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch22_q16: { concept: "HIV_DIAGNOSIS", skill: ["LAB_INTERPRETATION"], bloom: "COMPREHENSION" },
  ch22_q17: { concept: "HIV_TREATMENT", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  ch22_q18: { concept: "HIV_PREVENTION", skill: ["TEACHING"], bloom: "APPLICATION" },
  ch22_q19: { concept: "HIV_PROGRESSION", skill: ["LAB_INTERPRETATION", "PRIORITY"], bloom: "APPLICATION" },
  ch22_q20: { concept: "OPPORTUNISTIC_INFECTIONS", skill: ["PRIORITY"], bloom: "APPLICATION" },
  ch22_q21: { concept: "HIV_TREATMENT", skill: ["TEACHING", "TEACHING_ERROR", "MED_SAFETY"], bloom: "APPLICATION" },
  ch22_q22: { concept: "HIV_PROGRESSION", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  ch22_q23: { concept: "HIV_TREATMENT", skill: ["MED_SAFETY"], bloom: "KNOWLEDGE" },
  ch22_q24: { concept: "HIV_TREATMENT", skill: ["TEACHING", "TEACHING_ERROR", "MED_SAFETY"], bloom: "APPLICATION" },
  ch22_q25: { concept: "HIV_LEGAL", skill: ["TEACHING"], bloom: "COMPREHENSION" },

  // ===== QUIZ 1 REVIEW =====
  quiz1_q01: { concept: "IMMUNOGLOBULINS", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  quiz1_q02: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  quiz1_q03: { concept: "OSTEOARTHRITIS", skill: ["DIFFERENTIATION"], bloom: "APPLICATION" },
  quiz1_q04: { concept: "INFECTION_CONTROL", skill: ["TEACHING_ERROR"], bloom: "APPLICATION" },
  quiz1_q05: { concept: "HIV_PROGRESSION", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  quiz1_q06: { concept: "IMMUNITY_TYPES", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  quiz1_q07: { concept: "AUTOIMMUNE", skill: ["PRIORITY"], bloom: "APPLICATION" },
  quiz1_q08: { concept: "ANAPHYLAXIS", skill: ["PRIORITY", "SEQUENCING"], bloom: "APPLICATION" },
  quiz1_q09: { concept: "INFECTION_CONTROL", skill: ["DIFFERENTIATION"], bloom: "APPLICATION" },
  quiz1_q10: { concept: "HIV_TREATMENT", skill: ["TEACHING"], bloom: "COMPREHENSION" },
  quiz1_q11: { concept: "IMMUNITY_TYPES", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  quiz1_q12: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  quiz1_q13: { concept: "GOUT", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  quiz1_q14: { concept: "INFECTION_CONTROL", skill: ["PRIORITY"], bloom: "APPLICATION" },
  quiz1_q15: { concept: "OPPORTUNISTIC_INFECTIONS", skill: ["RECALL"], bloom: "KNOWLEDGE" },
  quiz1_q16: { concept: "IMMUNOGLOBULINS", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  quiz1_q17: { concept: "HYPERSENSITIVITY", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  quiz1_q18: { concept: "AUTOIMMUNE", skill: ["LAB_INTERPRETATION"], bloom: "APPLICATION" },
  quiz1_q19: { concept: "INFECTION_CONTROL", skill: ["TEACHING"], bloom: "COMPREHENSION" },
  quiz1_q20: { concept: "HIV_TREATMENT", skill: ["TEACHING"], bloom: "APPLICATION" },
  quiz1_q21: { concept: "IMMUNITY_TYPES", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
  quiz1_q22: { concept: "RHEUMATOID_ARTHRITIS", skill: ["MED_SAFETY"], bloom: "APPLICATION" },
  quiz1_q23: { concept: "PPE", skill: ["SEQUENCING"], bloom: "APPLICATION" },
  quiz1_q24: { concept: "HIV_PREVENTION", skill: ["PRIORITY", "SEQUENCING"], bloom: "APPLICATION" },
  quiz1_q25: { concept: "LEUKOCYTES", skill: ["DIFFERENTIATION"], bloom: "COMPREHENSION" },
};

// Helper function to enrich questions with metadata at runtime
export function enrichQuestions(questions) {
  return questions.map(q => ({
    ...q,
    chapter: q.id ? q.id.split('_')[0] : null,
    ...(questionTags[q.id] || {})
  }));
}

// Filter questions by mode
export function getPool(allQuestions, mode, chapterId = null) {
  let pool = allQuestions;

  // Filter by chapter if specified
  if (chapterId) {
    pool = pool.filter(q => q.chapter === chapterId);
  }

  // Filter by mode
  switch (mode) {
    case "CHAPTER_REVIEW":
      return pool;

    case "EXAM_TRAPS":
      return pool.filter(q => 
        q.skill?.includes("MED_SAFETY") || 
        q.skill?.includes("TEACHING_ERROR")
      );

    case "PRIORITY_FIRST":
      return pool.filter(q => q.skill?.includes("PRIORITY"));

    case "LABS_DIAGNOSTICS":
      return pool.filter(q => 
        q.skill?.includes("LAB_INTERPRETATION") || 
        q.concept?.includes("LAB_")
      );

    case "SEQUENCING":
      return pool.filter(q => q.skill?.includes("SEQUENCING"));

    case "DIFFERENTIATION":
      return pool.filter(q => q.skill?.includes("DIFFERENTIATION"));

    case "MED_SAFETY":
      return pool.filter(q => q.skill?.includes("MED_SAFETY"));

    case "TEACHING":
      return pool.filter(q => 
        q.skill?.includes("TEACHING") || 
        q.skill?.includes("TEACHING_ERROR")
      );

    default:
      return pool;
  }
}

// Track weakness by skill and concept
export function updateWeaknessStats(question, isCorrect, currentStats = {}) {
  if (isCorrect) return currentStats;

  const stats = { ...currentStats };
  
  // Track missed by skill
  if (question.skill) {
    stats.missedBySkill = { ...(stats.missedBySkill || {}) };
    question.skill.forEach(skill => {
      stats.missedBySkill[skill] = (stats.missedBySkill[skill] || 0) + 1;
    });
  }

  // Track missed by concept
  if (question.concept) {
    stats.missedByConcept = { ...(stats.missedByConcept || {}) };
    stats.missedByConcept[question.concept] = (stats.missedByConcept[question.concept] || 0) + 1;
  }

  // Track missed by Bloom level
  if (question.bloom) {
    stats.missedByBloom = { ...(stats.missedByBloom || {}) };
    stats.missedByBloom[question.bloom] = (stats.missedByBloom[question.bloom] || 0) + 1;
  }

  return stats;
}

// Get weakness builder pool (prioritizes weak areas)
export function getWeaknessPool(allQuestions, weaknessStats) {
  if (!weaknessStats || !weaknessStats.missedBySkill) {
    return allQuestions;
  }

  // Sort skills by miss count
  const sortedSkills = Object.entries(weaknessStats.missedBySkill)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  // Sort concepts by miss count
  const sortedConcepts = Object.entries(weaknessStats.missedByConcept || {})
    .sort((a, b) => b[1] - a[1])
    .map(([concept]) => concept);

  // Prioritize questions matching weak skills/concepts
  const prioritized = allQuestions.map(q => {
    let priority = 0;
    
    // Higher priority for weak skills
    if (q.skill) {
      q.skill.forEach(skill => {
        const index = sortedSkills.indexOf(skill);
        if (index !== -1) {
          priority += (sortedSkills.length - index) * 10;
        }
      });
    }

    // Higher priority for weak concepts
    if (q.concept) {
      const index = sortedConcepts.indexOf(q.concept);
      if (index !== -1) {
        priority += (sortedConcepts.length - index) * 5;
      }
    }

    return { ...q, _priority: priority };
  });

  // Sort by priority and return
  return prioritized
    .sort((a, b) => b._priority - a._priority)
    .map(({ _priority, ...q }) => q);
}

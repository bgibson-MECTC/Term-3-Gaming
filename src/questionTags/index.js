// Question Tags - Central Index
// Tag Overlay System: Keeps question content separate from metadata

import { ch18Tags } from "./ch18.tags.js";
import { ch19Tags } from "./ch19.tags.js";
import { ch20Tags } from "./ch20.tags.js";
import { ch21Tags } from "./ch21.tags.js";
import { ch22Tags } from "./ch22.tags.js";
import { quiz1Tags } from "./quiz1.tags.js";

// Combine all chapter tags into one lookup
export const questionTags = {
  ...ch18Tags,
  ...ch19Tags,
  ...ch20Tags,
  ...ch21Tags,
  ...ch22Tags,
  ...quiz1Tags,
};

/**
 * Enriches questions with metadata tags at runtime
 * @param {Array} questions - Array of base question objects
 * @returns {Array} Questions enriched with concept, skill, bloom, and chapter metadata
 */
export function enrichQuestions(questions) {
  return questions.map(q => {
    const tags = questionTags[q.id] || {};
    const chapter = q.id?.split("_")[0] || "unknown";
    
    return {
      ...q,
      chapter,
      concept: tags.concept || null,
      skill: tags.skill || [],
      bloom: tags.bloom || null,
    };
  });
}

/**
 * Auto-generates exam tips based on question tags
 * @param {Object} question - Enriched question object with tags
 * @returns {String} Context-aware exam tip
 */
export function getExamTip(question) {
  const { skill, concept } = question;
  
  // Priority skill tips
  if (skill?.includes("TEACHING_ERROR")) {
    return "💡 Exam Tip: 'Further teaching needed' = find the UNSAFE or INCORRECT statement.";
  }
  if (skill?.includes("MED_SAFETY")) {
    return "💡 Exam Tip: Medication questions are SAFETY questions. Think harm prevention first.";
  }
  if (skill?.includes("PRIORITY")) {
    return "💡 Exam Tip: Use ABC, Maslow, Safety first. Prevent harm > Comfort.";
  }
  if (skill?.includes("SEQUENCING")) {
    return "💡 Exam Tip: Follow proper order: Assessment before intervention, emergencies first.";
  }
  if (skill?.includes("LAB_INTERPRETATION")) {
    return "💡 Exam Tip: Know normal ranges. High/Low triggers action. Relate labs to symptoms.";
  }
  if (skill?.includes("INFECTION_CONTROL")) {
    return "💡 Exam Tip: Hand hygiene is #1. Know isolation types. PPE order matters.";
  }
  
  // Concept-specific tips
  if (concept === "ANAPHYLAXIS") {
    return "💡 Exam Tip: Anaphylaxis = EPINEPHRINE first, always. Airway is life.";
  }
  if (concept === "C_DIFF") {
    return "💡 Exam Tip: C. diff = SOAP & WATER only. Alcohol doesn't kill spores.";
  }
  if (concept === "HIV_PROGRESSION" || concept === "ANTIRETROVIRAL_THERAPY") {
    return "💡 Exam Tip: ART adherence >95%. Undetectable = Untransmittable (U=U).";
  }
  if (concept === "GOUT") {
    return "💡 Exam Tip: Gout = uric acid crystals. Colchicine for acute, Allopurinol prevents.";
  }
  if (concept === "RHEUMATOID_ARTHRITIS") {
    return "💡 Exam Tip: RA = symmetrical, morning stiffness >1hr, systemic. Methotrexate is gold standard.";
  }
  
  // Bloom level tips
  if (question.bloom === "APPLICATION") {
    return "💡 Exam Tip: Application questions test your clinical judgment. Think 'What would I do?'";
  }
  
  // Default tip
  return "💡 Exam Tip: Read carefully, eliminate wrong answers, trust your nursing judgment.";
}

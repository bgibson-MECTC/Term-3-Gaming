/**
 * Question Transformer
 * Converts knowledge-based questions into clinical application scenarios
 * for Ranked Mode to prevent memorization
 */

/**
 * Transforms a study mode question into a ranked mode clinical scenario
 * @param {Object} question - Original question from study mode
 * @returns {Object} Transformed question with clinical context
 */
export function transformToRankedQuestion(question) {
  const { text, options, correctIndex, rationale, concept, skill, bloom } = question;
  
  // 20% chance to use priority-based transformation (all options correct, differ by priority)
  const usePriorityTransform = Math.random() < 0.2;
  
  // Generate rationale options based on the concept
  const rationaleOptions = usePriorityTransform 
    ? generatePriorityRationales(question)
    : generateRationaleOptions(question);
  
  // Transform question text into clinical scenario
  const transformedText = usePriorityTransform
    ? transformToPriorityQuestion(text, concept, skill)
    : transformQuestionText(text, concept, skill);
  
  // Transform options to add clinical context and vary presentation
  const clinicalOptions = usePriorityTransform
    ? transformToPriorityOptions(options, correctIndex, concept, skill)
    : transformOptions(options, concept, skill);
  
  // Reorder options to prevent pattern recognition
  const { newOptions, newCorrectIndex } = shuffleOptions(clinicalOptions, correctIndex);
  
  return {
    ...question,
    originalText: text, // Keep original for reference
    text: transformedText,
    options: newOptions,
    correctIndex: newCorrectIndex,
    rationaleOptions, // Multiple choice rationales
    requiresRationale: true,
    correctRationaleIndex: 0, // Index of the correct rationale
    timeLimit: 30, // seconds
    isTransformed: true, // Flag to indicate transformation
    isPriorityQuestion: usePriorityTransform, // All options correct, differ by priority
  };
}

/**
 * Transforms answer options to add clinical urgency and vary presentation
 * Introduces new symptoms, timeframes, or complicating factors
 */
function transformOptions(options, concept, skills) {
  const transformationType = Math.floor(Math.random() * 3);
  
  // TYPE 1: Add time pressure or vital signs (40% chance)
  if (transformationType === 0) {
    return options.map(opt => addTimeOrVitals(opt));
  }
  
  // TYPE 2: Add patient context (30% chance)
  if (transformationType === 1) {
    return options.map(opt => addPatientContext(opt));
  }
  
  // TYPE 3: Keep original but add clinical outcome (30% chance)
  return options.map(opt => addClinicalOutcome(opt));
}

/**
 * Adds time urgency or vital sign information to options
 */
function addTimeOrVitals(option) {
  // Check if option already has clinical detail
  if (option.length > 60 || option.includes('BP') || option.includes('within')) {
    return option;
  }
  
  const enhancements = [
    ` within the next 5 minutes`,
    ` immediately to prevent deterioration`,
    ` while monitoring vital signs`,
    ` before condition worsens`,
    ` as first priority`,
  ];
  
  // 50% chance to add enhancement
  if (Math.random() > 0.5) {
    return option + enhancements[Math.floor(Math.random() * enhancements.length)];
  }
  
  return option;
}

/**
 * Adds patient context to make options more scenario-based
 */
function addPatientContext(option) {
  // Don't modify if already detailed
  if (option.length > 60) return option;
  
  const contexts = [
    `considering patient history`,
    `noting recent lab changes`,
    `observing current symptoms`,
    `based on assessment findings`,
  ];
  
  // 40% chance to add context
  if (Math.random() > 0.6) {
    const context = contexts[Math.floor(Math.random() * contexts.length)];
    return `${option} - ${context}`;
  }
  
  return option;
}

/**
 * Adds expected clinical outcome to option
 */
function addClinicalOutcome(option) {
  // Don't modify if already detailed
  if (option.length > 60) return option;
  
  const outcomes = [
    `to prevent complications`,
    `to stabilize condition`,
    `to ensure safety`,
    `to reduce risk`,
  ];
  
  // 30% chance to add outcome
  if (Math.random() > 0.7) {
    return `${option} ${outcomes[Math.floor(Math.random() * outcomes.length)]}`;
  }
  
  return option;
}

/**
 * Transforms question text into a clinical application scenario
 */
function transformQuestionText(text, concept, skills) {
  // If already a scenario, add urgency/priority element
  if (text.includes('nurse') && (text.includes('patient') || text.includes('client'))) {
    return addClinicalUrgency(text);
  }
  
  // Convert knowledge question to application
  return convertToScenario(text, concept, skills);
}

/**
 * Adds clinical urgency to existing scenarios
 */
function addClinicalUrgency(text) {
  const urgencyPrefixes = [
    "PRIORITY: ",
    "The nurse must first: ",
    "The most important action is: ",
    "To prevent complications, the nurse should: ",
  ];
  
  const prefix = urgencyPrefixes[Math.floor(Math.random() * urgencyPrefixes.length)];
  return prefix + text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Converts knowledge-based question into clinical scenario
 * Transforms question type to emphasize clinical reasoning over recall
 */
function convertToScenario(text, concept, skills) {
  // TRANSFORMATION TYPE 1: Teaching Error → Patient Misunderstanding
  if (skills?.includes('TEACHING_ERROR') || text.toLowerCase().includes('teaching') || text.toLowerCase().includes('indicates the need for further')) {
    return convertToPatientMisunderstanding(text, concept);
  }
  
  // TRANSFORMATION TYPE 2: Definition/Correlation → Clinical Finding Interpretation
  if (text.toLowerCase().includes('correlates') || text.toLowerCase().includes('function of')) {
    return convertToFindingInterpretation(text, concept);
  }
  
  // TRANSFORMATION TYPE 3: Identification → Prioritization
  if (text.toLowerCase().includes('which type') || text.toLowerCase().includes('which is')) {
    return convertToPrioritization(text, concept);
  }
  
  // TRANSFORMATION TYPE 4: Knowledge Question → Consequence/Intervention Question
  if (skills?.includes('PRIORITY') || text.toLowerCase().includes('most appropriate')) {
    return convertToConsequence(text, concept);
  }
  
  // TRANSFORMATION TYPE 5: Lab/Assessment → Immediate Action Needed
  if (skills?.includes('LAB_INTERPRETATION') || text.toLowerCase().includes('lab') || text.toLowerCase().includes('test')) {
    return convertToImmediateAction(text, concept);
  }
  
  // Default: add clinical context with urgency
  return addClinicalUrgency(`In caring for a patient with ${concept || 'this condition'}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`);
}

/**
 * TRANSFORMATION 1: Teaching → Patient Misunderstanding with Complication Risk
 * Example: "Which statement needs teaching?" → "Which statement puts patient at risk?"
 */
function convertToPatientMisunderstanding(text, concept) {
  const clinicalRisks = [
    `A patient with ${concept || 'this condition'} makes the following statement. Which indicates a misunderstanding that could lead to complications?`,
    `During discharge teaching for ${concept || 'this condition'}, which patient statement requires immediate intervention to prevent adverse outcomes?`,
    `The nurse is evaluating understanding of ${concept || 'this condition'}. Which statement suggests the patient is at risk for poor outcomes?`,
  ];
  return clinicalRisks[Math.floor(Math.random() * clinicalRisks.length)];
}

/**
 * TRANSFORMATION 2: Correlation/Function → Clinical Finding Interpretation  
 * Example: "Function of thymus?" → "Patient with thymus disorder shows which finding?"
 */
function convertToFindingInterpretation(text, concept) {
  const interpretations = [
    `A patient presents with abnormal ${concept || 'findings'}. The nurse anticipates which clinical manifestation will require priority intervention?`,
    `During assessment of ${concept || 'this system'}, which finding indicates the most urgent need for intervention?`,
    `The nurse notes changes in ${concept || 'function'}. Which assessment finding suggests immediate risk to the patient?`,
  ];
  return interpretations[Math.floor(Math.random() * interpretations.length)];
}

/**
 * TRANSFORMATION 3: Identification → Prioritization/Consequence
 * Example: "Which type releases heparin?" → "Patient with heparin response - what's priority?"
 */
function convertToPrioritization(text, concept) {
  const priorities = [
    `A patient shows signs consistent with ${concept || 'this process'}. Which assessment finding requires the nurse to act first?`,
    `In a patient experiencing ${concept || 'this condition'}, which finding indicates the highest priority for immediate intervention?`,
    `The nurse is caring for multiple patients. Which assessment finding related to ${concept || 'this system'} requires immediate attention?`,
  ];
  return priorities[Math.floor(Math.random() * priorities.length)];
}

/**
 * TRANSFORMATION 4: Appropriate Action → Preventing Complications
 * Example: "Most appropriate action?" → "To prevent which complication should nurse do X?"
 */
function convertToConsequence(text, concept) {
  const consequences = [
    `To prevent complications in a patient with ${concept || 'this condition'}, the nurse's priority action is:`,
    `A patient with ${concept || 'this condition'} is at risk for deterioration. Which intervention should the nurse implement first?`,
    `The nurse identifies early signs of ${concept || 'complications'}. Which action will prevent further decline?`,
  ];
  return consequences[Math.floor(Math.random() * consequences.length)];
}

/**
 * TRANSFORMATION 5: Lab/Test → Immediate Clinical Decision
 * Example: "What does test measure?" → "Abnormal result found - what's priority?"
 */
function convertToImmediateAction(text, concept) {
  const actions = [
    `A patient's lab results show abnormalities related to ${concept || 'this system'}. Which finding requires immediate notification of the provider?`,
    `During review of diagnostic tests for ${concept || 'this condition'}, which result indicates the need for urgent intervention?`,
    `The nurse receives critical lab values related to ${concept || 'function'}. Which finding poses the greatest immediate threat?`,
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

/**
 * TRANSFORMATION TYPE 6: Priority-Based Questions
 * All options are clinically correct interventions, but differ in priority level
 * Tests clinical judgment and ability to recognize most urgent need
 */
function transformToPriorityQuestion(text, concept, skills) {
  const priorityFrames = [
    `A patient with ${concept || 'this condition'} requires multiple interventions. Which action should the nurse complete first?`,
    `The nurse is caring for a patient with ${concept || 'this condition'}. All of the following are appropriate, but which is the highest priority?`,
    `When caring for a patient with ${concept || 'this condition'}, the nurse recognizes several needs. Which intervention is most important initially?`,
    `A patient presents with ${concept || 'this condition'}. The nurse plans care. Which action should take priority?`,
  ];
  return priorityFrames[Math.floor(Math.random() * priorityFrames.length)];
}

/**
 * Transforms options into priority-based interventions
 * All options become clinically correct but differ in urgency/sequence
 */
function transformToPriorityOptions(options, correctIndex, concept, skills) {
  const priorityLevels = [
    { level: 'immediate', phrases: ['Assess airway and breathing', 'Check vital signs', 'Ensure patent IV access', 'Position for optimal perfusion'] },
    { level: 'urgent', phrases: ['Administer prescribed medication', 'Notify healthcare provider', 'Obtain lab specimens', 'Review current medications'] },
    { level: 'important', phrases: ['Document findings', 'Educate patient', 'Assess pain level', 'Provide comfort measures'] },
    { level: 'routine', phrases: ['Update care plan', 'Coordinate with team', 'Schedule follow-up', 'Prepare discharge instructions'] }
  ];
  
  return options.map((opt, idx) => {
    // Correct answer gets highest priority framing
    if (idx === correctIndex) {
      return reframeToPriority(opt, 'immediate', concept);
    }
    
    // Distribute other options across lower priority levels
    const priorityLevel = idx % 3 === 0 ? 'urgent' : idx % 3 === 1 ? 'important' : 'routine';
    return reframeToPriority(opt, priorityLevel, concept);
  });
}

/**
 * Reframes an option to sound clinically appropriate but at specified priority level
 */
function reframeToPriority(option, priorityLevel, concept) {
  // Remove absolute terms
  let reframed = option
    .replace(/\b(always|never|must|only|all)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Add priority-appropriate context
  const contexts = {
    immediate: [
      reframed,
      `${reframed} to stabilize condition`,
      `${reframed} as priority intervention`,
    ],
    urgent: [
      `${reframed} after initial assessment`,
      `${reframed} following stabilization`,
      `${reframed} once safety is ensured`,
    ],
    important: [
      `${reframed} when condition permits`,
      `${reframed} during ongoing care`,
      `${reframed} as part of comprehensive plan`,
    ],
    routine: [
      `${reframed} before discharge`,
      `${reframed} during follow-up care`,
      `${reframed} when time allows`,
    ]
  };
  
  const choices = contexts[priorityLevel] || contexts['important'];
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Generates rationales for priority-based questions
 * Explains why other options, though correct, are not the highest priority
 */
function generatePriorityRationales(question) {
  const { concept, skill, correctIndex, options } = question;
  
  return [
    // Correct rationale (index 0)
    `This addresses the most immediate physiological need based on nursing priorities (ABCs - Airway, Breathing, Circulation). While other options are appropriate, they can be delayed until the patient is stabilized.`,
    
    // Plausible but incorrect rationales
    `This intervention is important for ongoing care, but does not address the most urgent need. Patient safety and physiological stability take precedence over this action.`,
    
    `While this is clinically appropriate and should be completed, it represents a secondary priority. The immediate threat to patient well-being must be addressed first.`,
    
    `This action is part of comprehensive nursing care but can be safely delayed. The highest priority intervention focuses on preventing immediate complications or harm.`,
  ];
}

/**
 * Generates plausible rationale options
 */
function generateRationaleOptions(question) {
  const { concept, skill, bloom, correctIndex, options } = question;
  
  const correctAnswer = options[correctIndex];
  
  return [
    // Correct rationale (index 0)
    generateCorrectRationale(question),
    
    // Plausible but incorrect rationales
    `This option addresses a different priority in ${concept || 'care'}`,
    `While related to ${skill?.[0] || 'the concept'}, this doesn't address the immediate need`,
    `This action would be appropriate at a later stage of care`,
  ];
}

/**
 * Generates correct rationale based on question metadata
 */
function generateCorrectRationale(question) {
  const { concept, skill, bloom, rationale } = question;
  
  // Extract key reasoning from original rationale
  if (rationale) {
    const sentences = rationale.split('.');
    if (sentences.length > 0) {
      return sentences[0] + '.'; // First sentence is usually the key point
    }
  }
  
  // Generate based on metadata
  if (skill?.includes('PRIORITY')) {
    return `This addresses the most critical need based on ${concept || 'nursing priorities'}`;
  }
  
  if (bloom === 'Analyze') {
    return `This option requires analyzing the situation and applying clinical judgment`;
  }
  
  return `This is the correct action based on evidence-based practice`;
}

/**
 * Shuffles options to prevent pattern recognition
 */
function shuffleOptions(options, correctIndex) {
  const correctAnswer = options[correctIndex];
  
  // Create array of indices
  const indices = options.map((_, i) => i);
  
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // Reorder options
  const newOptions = indices.map(i => options[i]);
  const newCorrectIndex = indices.indexOf(correctIndex);
  
  return { newOptions, newCorrectIndex };
}

/**
 * Calculates rationale quality score
 * @param {number} selectedRationaleIndex - Index of rationale chosen by student
 * @param {number} correctRationaleIndex - Index of correct rationale
 * @returns {number} Score from 0-100
 */
export function scoreRationale(selectedRationaleIndex, correctRationaleIndex) {
  if (selectedRationaleIndex === correctRationaleIndex) {
    return 100; // Perfect reasoning
  }
  return 0; // Incorrect reasoning
}

/**
 * Calculates time bonus/penalty
 * @param {number} timeSpent - Seconds spent on question
 * @param {number} timeLimit - Maximum time allowed
 * @returns {number} Multiplier (0.5 to 1.5)
 */
export function calculateTimeMultiplier(timeSpent, timeLimit) {
  if (timeSpent < 3) {
    // Too fast - rushed/guessing penalty
    return 0.5;
  } else if (timeSpent <= 15) {
    // Excellent timing - bonus points
    return 1.3;
  } else if (timeSpent <= 22) {
    // Good pace - full points
    return 1.0;
  } else if (timeSpent <= timeLimit) {
    // Acceptable but slow - small penalty
    return 0.9;
  } else {
    // Over time - larger penalty
    return 0.7;
  }
}

/**
 * Detects answer patterns that suggest guessing
 * @param {Array} recentAnswers - Last 5 answer indices
 * @returns {boolean} True if pattern detected
 */
export function detectAnswerPattern(recentAnswers) {
  if (recentAnswers.length < 5) return false;
  
  // Check if all same answer
  const allSame = recentAnswers.every(a => a === recentAnswers[0]);
  if (allSame) return true;
  
  // Check if alternating pattern (0,1,0,1,0)
  let alternating = true;
  for (let i = 1; i < recentAnswers.length; i++) {
    if (recentAnswers[i] === recentAnswers[i - 1]) {
      alternating = false;
      break;
    }
  }
  if (alternating) return true;
  
  // Check if sequential (0,1,2,3,0 or similar)
  let sequential = true;
  for (let i = 1; i < recentAnswers.length; i++) {
    if ((recentAnswers[i] - recentAnswers[i - 1] + 4) % 4 !== 1) {
      sequential = false;
      break;
    }
  }
  
  return sequential;
}

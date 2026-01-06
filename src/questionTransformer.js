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
  
  // Generate rationale options based on the concept
  const rationaleOptions = generateRationaleOptions(question);
  
  // Transform question text into clinical scenario
  const transformedText = transformQuestionText(text, concept, skill);
  
  // Reorder options to prevent pattern recognition
  const { newOptions, newCorrectIndex } = shuffleOptions(options, correctIndex);
  
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
  };
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
 */
function convertToScenario(text, concept, skills) {
  // Check if it's asking for teaching/education
  if (skills?.includes('TEACHING_ERROR') || text.toLowerCase().includes('teaching')) {
    return `A patient asks the nurse about ${concept || 'this topic'}. ${text}`;
  }
  
  // Check if it's assessment
  if (skills?.includes('ASSESSMENT') || text.toLowerCase().includes('correlate')) {
    return `During assessment, the nurse notes findings related to ${concept || 'this condition'}. ${text}`;
  }
  
  // Default: add clinical context
  return `In caring for a patient with ${concept || 'this condition'}, the nurse considers: ${text}`;
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
  if (timeSpent <= timeLimit * 0.5) {
    // Too fast - might be guessing
    return 0.7;
  } else if (timeSpent <= timeLimit * 0.75) {
    // Good pace
    return 1.2;
  } else if (timeSpent <= timeLimit) {
    // Normal pace
    return 1.0;
  } else {
    // Over time - penalty
    return 0.8;
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

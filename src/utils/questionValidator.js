/**
 * Question Data Validation Utility
 * Validates question objects against required schema
 * Warns if required fields are missing
 */

/**
 * Required fields for standard questions
 */
const STANDARD_QUESTION_SCHEMA = {
  id: 'string',
  text: 'string',
  options: 'array',
  correctIndex: 'number',
  rationale: 'string'
};

/**
 * Required fields for challenge mode questions
 */
const CHALLENGE_QUESTION_SCHEMA = {
  id: 'string',
  title: 'string',
  prompt: 'string',
  stem: 'string',
  choices: 'array',
  correctIndex: 'number|array', // Can be single or multiple for SATA
  rationaleCorrect: 'string',
  rationaleWrong: 'array',
  difficulty: 'number',
  timerSeconds: 'number'
};

/**
 * Required fields for clinical judgment questions
 */
const CLINICAL_JUDGMENT_SCHEMA = {
  id: 'string',
  text: 'string',
  scenario: 'string',
  options: 'array',
  correctIndex: 'number|array',
  timeLimit: 'number',
  rationale: 'string',
  skill: 'array',
  bloom: 'string',
  difficulty: 'number'
};

/**
 * Validates a single question against a schema
 * @param {Object} question - The question object to validate
 * @param {Object} schema - The schema to validate against
 * @param {string} questionType - Type of question for error messages
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateQuestion(question, schema, questionType = 'Question') {
  const errors = [];
  const warnings = [];

  // Check for required fields
  for (const [field, type] of Object.entries(schema)) {
    if (!(field in question)) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    const value = question[field];
    const types = type.split('|');
    let validType = false;

    for (const expectedType of types) {
      if (expectedType === 'array' && Array.isArray(value)) {
        validType = true;
        break;
      } else if (expectedType === 'number' && typeof value === 'number') {
        validType = true;
        break;
      } else if (expectedType === 'string' && typeof value === 'string') {
        validType = true;
        break;
      }
    }

    if (!validType) {
      errors.push(`Field ${field} has wrong type. Expected: ${type}, got: ${typeof value}`);
    }
  }

  // Validate options/choices array length
  const optionsField = question.options || question.choices;
  if (optionsField && Array.isArray(optionsField)) {
    if (optionsField.length < 2) {
      errors.push('Must have at least 2 answer choices');
    }
    if (optionsField.some(opt => !opt || (typeof opt === 'string' && opt.trim() === ''))) {
      errors.push('All answer choices must have content');
    }
  }

  // Validate correctIndex
  if ('correctIndex' in question) {
    const correctIndex = question.correctIndex;
    const optionsLength = optionsField ? optionsField.length : 0;
    
    if (Array.isArray(correctIndex)) {
      // SATA question
      if (correctIndex.length === 0) {
        errors.push('SATA question must have at least one correct answer');
      }
      correctIndex.forEach(idx => {
        if (idx < 0 || idx >= optionsLength) {
          errors.push(`correctIndex ${idx} out of range (0-${optionsLength-1})`);
        }
      });
    } else if (typeof correctIndex === 'number') {
      if (correctIndex < 0 || correctIndex >= optionsLength) {
        errors.push(`correctIndex ${correctIndex} out of range (0-${optionsLength-1})`);
      }
    }
  }

  // Optional field warnings
  if (!question.rationale && !question.rationaleCorrect) {
    warnings.push('No rationale provided - students won\'t learn from mistakes');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates an array of questions
 * @param {Array} questions - Array of question objects
 * @param {string} questionType - Type of questions for schema selection
 * @returns {Object} - Validation results with summary
 */
function validateQuestions(questions, questionType = 'standard') {
  let schema;
  
  switch (questionType.toLowerCase()) {
    case 'challenge':
      schema = CHALLENGE_QUESTION_SCHEMA;
      break;
    case 'clinical':
    case 'clinical-judgment':
      schema = CLINICAL_JUDGMENT_SCHEMA;
      break;
    default:
      schema = STANDARD_QUESTION_SCHEMA;
  }

  const results = {
    totalQuestions: questions.length,
    valid: 0,
    invalid: 0,
    questionResults: []
  };

  questions.forEach((question, index) => {
    const validation = validateQuestion(question, schema, questionType);
    
    if (validation.valid) {
      results.valid++;
    } else {
      results.invalid++;
    }

    results.questionResults.push({
      questionId: question.id || `Question ${index + 1}`,
      index,
      ...validation
    });
  });

  return results;
}

/**
 * Logs validation results to console
 * @param {Object} results - Validation results from validateQuestions
 * @param {boolean} verbose - Whether to show all details
 */
function logValidationResults(results, verbose = false) {
  console.log('\n═══════════════════════════════════════');
  console.log('📋 QUESTION VALIDATION RESULTS');
  console.log('═══════════════════════════════════════');
  console.log(`Total Questions: ${results.totalQuestions}`);
  console.log(`✅ Valid: ${results.valid}`);
  console.log(`❌ Invalid: ${results.invalid}`);
  console.log('═══════════════════════════════════════\n');

  if (results.invalid > 0 || verbose) {
    results.questionResults.forEach((result) => {
      if (!result.valid || verbose) {
        console.log(`\n🔍 ${result.questionId} (Index: ${result.index})`);
        
        if (result.errors.length > 0) {
          console.log('  ❌ Errors:');
          result.errors.forEach(err => console.log(`     - ${err}`));
        }
        
        if (result.warnings.length > 0) {
          console.log('  ⚠️  Warnings:');
          result.warnings.forEach(warn => console.log(`     - ${warn}`));
        }
      }
    });
  }

  if (results.invalid === 0) {
    console.log('✨ All questions passed validation!\n');
  }
}

// ES6 export for React/Webpack
export {
  validateQuestion,
  validateQuestions,
  logValidationResults,
  STANDARD_QUESTION_SCHEMA,
  CHALLENGE_QUESTION_SCHEMA,
  CLINICAL_JUDGMENT_SCHEMA
};

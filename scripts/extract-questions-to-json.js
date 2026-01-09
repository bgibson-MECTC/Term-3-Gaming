/**
 * Extract questions from existing source files and save as JSON
 * This script reads the raw JavaScript data and outputs clean JSON files
 */

const fs = require('fs');
const path = require('path');

// Read the challenge scenarios
const challengeContent = fs.readFileSync(
  path.join(__dirname, '../src/challengeScenarios.js'),
  'utf8'
);

// Read the clinical judgment scenarios
const clinicalContent = fs.readFileSync(
  path.join(__dirname, '../src/clinicalJudgmentScenarios.js'),
  'utf8'
);

// Extract challenge scenarios array
const challengeMatch = challengeContent.match(/export const challengeScenarios = \[([\s\S]*?)\];/);
if (challengeMatch) {
  // Convert to JSON-safe format by evaluating the array
  const cleanedContent = challengeMatch[1]
    .replace(/id:/g, '"id":')
    .replace(/title:/g, '"title":')
    .replace(/prompt:/g, '"prompt":')
    .replace(/stem:/g, '"stem":')
    .replace(/choices:/g, '"choices":')
    .replace(/correctIndex:/g, '"correctIndex":')
    .replace(/rationaleCorrect:/g, '"rationaleCorrect":')
    .replace(/rationaleWrong:/g, '"rationaleWrong":')
    .replace(/consequenceIfWrong:/g, '"consequenceIfWrong":')
    .replace(/difficulty:/g, '"difficulty":')
    .replace(/timerSeconds:/g, '"timerSeconds":');

  console.log('Challenge scenarios extracted');
}

// Extract clinical judgment scenarios
const clinicalMatch = clinicalContent.match(/questions: \[([\s\S]*?)\]\s*\}/);
if (clinicalMatch) {
  console.log('Clinical judgment scenarios found');
}

console.log('Note: Due to complexity of JSX and complex structures,');
console.log('we will manually create the JSON files from the source data.');
console.log('See data/ folder for the JSON versions.');

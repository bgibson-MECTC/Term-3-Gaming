#!/usr/bin/env node

/**
 * Test script for question validation
 * Run: node scripts/test-questions.js
 */

const fs = require('fs');
const path = require('path');

// Import validation functions
const { 
  validateQuestions, 
  logValidationResults 
} = require('../src/utils/questionValidator');

console.log('╔═══════════════════════════════════════════╗');
console.log('║   Question Validation Test Suite         ║');
console.log('╚═══════════════════════════════════════════╝\n');

const dataDir = path.join(__dirname, '../data');

// List of JSON files to validate
const questionFiles = [
  { file: 'ch18-questions.json', type: 'standard' },
  { file: 'ch19-questions.json', type: 'standard' },
  { file: 'ch20-questions.json', type: 'standard' },
  { file: 'ch21-questions.json', type: 'standard' },
  { file: 'ch22-questions.json', type: 'standard' },
  { file: 'quiz1-questions.json', type: 'standard' },
  { file: 'challenge-scenarios.json', type: 'challenge' },
  { file: 'clinical-judgment-scenarios.json', type: 'clinical-judgment' }
];

let totalValid = 0;
let totalInvalid = 0;
let totalFiles = 0;

questionFiles.forEach(({ file, type }) => {
  const filePath = path.join(dataDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)\n`);
    return;
  }

  totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    
    console.log(`\n📄 Validating: ${file}`);
    console.log(`   Type: ${type}`);
    console.log(`   Questions: ${questions.length}\n`);
    
    const results = validateQuestions(questions, type);
    logValidationResults(results);
    
    totalValid += results.valid;
    totalInvalid += results.invalid;
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n╔═══════════════════════════════════════════╗');
console.log('║          VALIDATION SUMMARY               ║');
console.log('╚═══════════════════════════════════════════╝');
console.log(`Files Validated: ${totalFiles}`);
console.log(`Total Questions: ${totalValid + totalInvalid}`);
console.log(`✅ Valid: ${totalValid}`);
console.log(`❌ Invalid: ${totalInvalid}`);

if (totalInvalid === 0) {
  console.log('\n🎉 All questions passed validation!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${totalInvalid} questions need attention\n`);
  process.exit(1);
}

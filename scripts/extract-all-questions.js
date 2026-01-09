#!/usr/bin/env node

/**
 * Extract all chapter questions from RNMasteryGame.jsx to JSON files
 * This script parses the INITIAL_DATA array and creates individual JSON files
 * for each chapter (ch18-ch22, quiz1)
 */

const fs = require('fs');
const path = require('path');

// Read the main game file
const gameFilePath = path.join(__dirname, '../src/RNMasteryGame.jsx');
const gameContent = fs.readFileSync(gameFilePath, 'utf8');

console.log('🔍 Extracting questions from RNMasteryGame.jsx...\n');

// Find the INITIAL_DATA array
const initialDataMatch = gameContent.match(/const INITIAL_DATA = \[([\s\S]*?)\n\];/);

if (!initialDataMatch) {
  console.error('❌ Could not find INITIAL_DATA array');
  process.exit(1);
}

// Extract individual chapter blocks
const dataContent = initialDataMatch[1];

// Match each chapter object
const chapterRegex = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*title:\s*['"]([^'"]+)['"][\s\S]*?questions:\s*\[([\s\S]*?)\]\s*\}/g;

let match;
const chapters = [];

while ((match = chapterRegex.exec(dataContent)) !== null) {
  const chapterId = match[1];
  const title = match[2];
  const questionsBlock = match[3];
  
  // Skip special chapters that are already JSON
  if (chapterId === 'day-to-be-wrong') {
    console.log(`⏭️  Skipping ${chapterId} (already in JSON)`);
    continue;
  }
  
  console.log(`📝 Processing: ${chapterId} - ${title}`);
  
  // Parse questions from the block
  const questions = parseQuestions(questionsBlock);
  
  if (questions.length > 0) {
    chapters.push({
      id: chapterId,
      title: title,
      questions: questions
    });
    console.log(`   ✓ Found ${questions.length} questions`);
  } else {
    console.warn(`   ⚠️  No questions found`);
  }
}

// Save each chapter to its own JSON file
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

chapters.forEach(chapter => {
  const filename = `${chapter.id}-questions.json`;
  const filepath = path.join(dataDir, filename);
  
  // Write just the questions array (not the chapter metadata)
  fs.writeFileSync(
    filepath,
    JSON.stringify(chapter.questions, null, 2),
    'utf8'
  );
  
  console.log(`💾 Saved: ${filename}`);
});

console.log(`\n✅ Extraction complete! Created ${chapters.length} JSON files.`);
console.log('\nNext steps:');
console.log('1. Review the JSON files in data/ folder');
console.log('2. Run: node scripts/test-questions.js');
console.log('3. Update RNMasteryGame.jsx to use questionBridge');

/**
 * Parse questions from a JavaScript object string
 */
function parseQuestions(questionsBlock) {
  const questions = [];
  
  // Match individual question objects
  const questionRegex = /\{[\s\S]*?id:\s*["']([^"']+)["'][\s\S]*?\}/g;
  
  let qMatch;
  while ((qMatch = questionRegex.exec(questionsBlock)) !== null) {
    const questionText = qMatch[0];
    
    try {
      // Extract question fields with more robust parsing
      const question = {
        id: extractField(questionText, 'id'),
        text: extractField(questionText, 'text'),
        options: extractArray(questionText, 'options'),
        correctIndex: extractNumber(questionText, 'correctIndex'),
        rationale: extractField(questionText, 'rationale')
      };
      
      // Validate required fields
      if (question.id && question.text && question.options && 
          question.correctIndex !== null && question.rationale) {
        questions.push(question);
      } else {
        console.warn(`   ⚠️  Incomplete question: ${question.id || 'unknown'}`);
      }
    } catch (error) {
      console.error(`   ❌ Error parsing question: ${error.message}`);
    }
  }
  
  return questions;
}

/**
 * Extract a string field value
 */
function extractField(text, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*["']([^"']*?)["']`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract a number field value
 */
function extractNumber(text, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*(\\d+)`);
  const match = text.match(regex);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract an array field value
 */
function extractArray(text, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*\\[([^\\]]+)\\]`, 's');
  const match = text.match(regex);
  
  if (!match) return null;
  
  const arrayContent = match[1];
  
  // Split by commas, but respect quoted strings
  const items = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;
  
  for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];
    
    if ((char === '"' || char === "'") && arrayContent[i-1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      }
      continue; // Skip quote characters
    }
    
    if (char === ',' && !inQuotes) {
      if (current.trim()) {
        items.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last item
  if (current.trim()) {
    items.push(current.trim());
  }
  
  return items;
}

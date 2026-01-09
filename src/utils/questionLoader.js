/**
 * Question Data Loader
 * 
 * CRITICAL RULES:
 * 1. JSON files are the SOURCE OF TRUTH
 * 2. NEVER mutate the loaded data
 * 3. Always return deep copies for gameplay
 * 4. Validate all questions on load
 * 
 * Usage:
 *   const loader = new QuestionLoader();
 *   await loader.initialize();
 *   const questions = loader.getQuestionsForChapter('ch18'); // Returns shuffled copy
 *   const original = loader.getRawQuestions('ch18'); // Returns immutable original
 */

import { 
  validateQuestions, 
  logValidationResults 
} from './questionValidator';

class QuestionLoader {
  constructor() {
    this._chapters = null;
    this._questionCache = new Map(); // Stores immutable original data
    this._initialized = false;
  }

  /**
   * Initialize the loader by fetching all question data
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      console.warn('QuestionLoader already initialized');
      return;
    }

    try {
      // Load chapter metadata
      const basePath = process.env.PUBLIC_URL || '';
      const chaptersResponse = await fetch(`${basePath}/data/chapters.json`);
      if (!chaptersResponse.ok) {
        throw new Error(`Failed to load chapters: ${chaptersResponse.statusText}`);
      }
      this._chapters = await chaptersResponse.json();

      console.log(`📚 Loaded ${this._chapters.length} chapters`);

      // Load all question banks
      await this._loadAllQuestions();

      this._initialized = true;
      console.log('✅ QuestionLoader initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize QuestionLoader:', error);
      throw error;
    }
  }

  /**
   * Load all question files
   * @private
   */
  async _loadAllQuestions() {
    // Map of chapter IDs to their JSON files
    const basePath = process.env.PUBLIC_URL || '';
    const questionFiles = {
      'ch18': `${basePath}/data/ch18-questions.json`,
      'ch19': `${basePath}/data/ch19-questions.json`,
      'ch20': `${basePath}/data/ch20-questions.json`,
      'ch21': `${basePath}/data/ch21-questions.json`,
      'ch22': `${basePath}/data/ch22-questions.json`,
      'quiz1': `${basePath}/data/quiz1-questions.json`,
      'challenge': `${basePath}/data/challenge-scenarios.json`,
      'clinical-judgment': `${basePath}/data/clinical-judgment-scenarios.json`,
      'day-to-be-wrong': `${basePath}/data/clinical-judgment-scenarios.json` // Same file
    };

    // Load each question file
    for (const [key, filepath] of Object.entries(questionFiles)) {
      try {
        const response = await fetch(filepath);
        if (!response.ok) {
          console.warn(`⚠️  Could not load ${filepath}: ${response.statusText}`);
          continue;
        }

        const questions = await response.json();
        
        // Validate questions
        const validation = validateQuestions(questions, key);
        
        if (validation.invalid > 0) {
          console.warn(`⚠️  ${filepath} has ${validation.invalid} invalid questions`);
          logValidationResults(validation);
        } else {
          console.log(`✅ ${filepath}: ${validation.valid} valid questions`);
        }

        // Store IMMUTABLE copy
        this._questionCache.set(key, Object.freeze(questions));
      } catch (error) {
        console.error(`❌ Error loading ${filepath}:`, error);
      }
    }
  }

  /**
   * Get chapters list
   * @returns {Array} - Array of chapter metadata
   */
  getChapters() {
    this._ensureInitialized();
    // Return deep copy to prevent mutations
    return JSON.parse(JSON.stringify(this._chapters));
  }

  /**
   * Get chapter metadata by ID
   * @param {string} chapterId - Chapter ID
   * @returns {Object|null} - Chapter metadata or null
   */
  getChapter(chapterId) {
    this._ensureInitialized();
    const chapter = this._chapters.find(ch => ch.id === chapterId);
    return chapter ? JSON.parse(JSON.stringify(chapter)) : null;
  }

  /**
   * Get IMMUTABLE original questions (for reference only)
   * @param {string} chapterId - Chapter ID
   * @returns {Array} - Frozen array of questions
   */
  getRawQuestions(chapterId) {
    this._ensureInitialized();
    
    // Map chapter IDs to cache keys
    const cacheKey = this._getCacheKey(chapterId);
    const questions = this._questionCache.get(cacheKey);
    
    if (!questions) {
      console.warn(`No questions found for chapter: ${chapterId}`);
      return [];
    }

    // Return the frozen original (cannot be modified)
    return questions;
  }

  /**
   * Get a SHUFFLED COPY of questions for gameplay
   * THIS IS WHAT THE GAME SHOULD USE
   * @param {string} chapterId - Chapter ID
   * @param {boolean} shuffle - Whether to shuffle (default: true)
   * @returns {Array} - Mutable copy of questions
   */
  getQuestionsForChapter(chapterId, shuffle = true) {
    this._ensureInitialized();
    
    const originalQuestions = this.getRawQuestions(chapterId);
    
    // Create deep copy
    const questionsCopy = JSON.parse(JSON.stringify(originalQuestions));
    
    // Shuffle if requested
    if (shuffle) {
      this._shuffleArray(questionsCopy);
    }
    
    return questionsCopy;
  }

  /**
   * Get a SHUFFLED COPY of specific number of questions
   * @param {string} chapterId - Chapter ID
   * @param {number} count - Number of questions to return
   * @param {boolean} shuffle - Whether to shuffle (default: true)
   * @returns {Array} - Mutable copy of questions
   */
  getRandomQuestions(chapterId, count, shuffle = true) {
    const questions = this.getQuestionsForChapter(chapterId, shuffle);
    return questions.slice(0, Math.min(count, questions.length));
  }

  /**
   * Get total number of questions for a chapter
   * @param {string} chapterId - Chapter ID
   * @returns {number} - Question count
   */
  getQuestionCount(chapterId) {
    const questions = this.getRawQuestions(chapterId);
    return questions.length;
  }

  /**
   * Validate all loaded questions
   * @returns {Object} - Validation summary
   */
  validateAllQuestions() {
    this._ensureInitialized();
    
    const results = {
      total: 0,
      valid: 0,
      invalid: 0,
      byChapter: {}
    };

    for (const [key, questions] of this._questionCache.entries()) {
      const validation = validateQuestions(questions, key);
      
      results.total += validation.totalQuestions;
      results.valid += validation.valid;
      results.invalid += validation.invalid;
      results.byChapter[key] = validation;
      
      if (validation.invalid > 0) {
        console.log(`\n📦 Validation for: ${key}`);
        logValidationResults(validation);
      }
    }

    return results;
  }

  /**
   * Map chapter ID to cache key
   * @private
   */
  _getCacheKey(chapterId) {
    // Special mappings
    if (chapterId === 'day-to-be-wrong') return 'clinical-judgment';
    if (chapterId.startsWith('challenge')) return 'challenge';
    
    // Standard chapters use their own files (to be created)
    return chapterId;
  }

  /**
   * Fisher-Yates shuffle algorithm
   * @private
   */
  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Ensure loader is initialized
   * @private
   */
  _ensureInitialized() {
    if (!this._initialized) {
      throw new Error('QuestionLoader not initialized. Call initialize() first.');
    }
  }

  /**
   * Get loader statistics
   * @returns {Object} - Statistics about loaded data
   */
  getStats() {
    this._ensureInitialized();
    
    const stats = {
      chapters: this._chapters.length,
      questionBanks: this._questionCache.size,
      totalQuestions: 0,
      questionsByBank: {}
    };

    for (const [key, questions] of this._questionCache.entries()) {
      const count = questions.length;
      stats.totalQuestions += count;
      stats.questionsByBank[key] = count;
    }

    return stats;
  }
}

// Export singleton instance
const questionLoader = new QuestionLoader();

export default questionLoader;
export { QuestionLoader };

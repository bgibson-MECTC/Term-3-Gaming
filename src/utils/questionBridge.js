/**
 * Question Data Bridge
 * 
 * This module provides a backward-compatible interface between
 * the new JSON-based question loader and the existing game code.
 * 
 * It maintains the same API as the old INITIAL_DATA constant
 * but loads data from JSON files instead.
 */

import questionLoader from './questionLoader';

// Icons mapping (since JSON can't store JSX)
import { 
  Shield, 
  AlertCircle, 
  Activity, 
  Bug, 
  Brain,
  Scale
} from 'lucide-react';

const ICON_MAP = {
  'Shield': Shield,
  'AlertCircle': AlertCircle,
  'Activity': Activity,
  'Bug': Bug,
  'Brain': Brain,
  'Scale': Scale,
  'Bone': Activity // Fallback if Bone icon doesn't exist
};

/**
 * Initialize the question system
 * Call this once when the app starts
 */
export async function initializeQuestions() {
  try {
    await questionLoader.initialize();
    console.log('✅ Question system initialized');
    console.log('📊 Stats:', questionLoader.getStats());
    
    // Validate all questions
    const validation = questionLoader.validateAllQuestions();
    if (validation.invalid > 0) {
      console.warn(`⚠️  ${validation.invalid} invalid questions found`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize questions:', error);
    return false;
  }
}

/**
 * Get all chapters with their metadata
 * Compatible with old INITIAL_DATA format
 * 
 * NOTE: This returns a COPY - not the originals
 * Shuffling/filtering this data is safe
 */
export function getAllChapters() {
  try {
    const chapters = questionLoader.getChapters();
    
    // Transform chapters to match old format with icons
    return chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      icon: getIconComponent(chapter.iconName),
      description: chapter.description,
      questions: [] // Questions loaded separately
    }));
  } catch (error) {
    console.error('Error loading chapters:', error);
    return [];
  }
}

/**
 * Get questions for a specific chapter
 * Returns a SHUFFLED COPY safe for gameplay
 * 
 * @param {string} chapterId - Chapter ID
 * @param {boolean} shuffle - Whether to shuffle (default: true)
 * @returns {Array} - Copy of questions
 */
export function getChapterQuestions(chapterId, shuffle = true) {
  try {
    // Special handling for challenge modes
    if (chapterId === 'challenge-mode') {
      return questionLoader.getQuestionsForChapter('challenge', shuffle);
    }
    
    if (chapterId === 'day-to-be-wrong') {
      return questionLoader.getQuestionsForChapter('clinical-judgment', shuffle);
    }
    
    // Standard chapters
    return questionLoader.getQuestionsForChapter(chapterId, shuffle);
  } catch (error) {
    console.error(`Error loading questions for ${chapterId}:`, error);
    return [];
  }
}

/**
 * Get a specific number of random questions from a chapter
 * 
 * @param {string} chapterId - Chapter ID
 * @param {number} count - Number of questions to return
 * @returns {Array} - Shuffled copy of questions
 */
export function getRandomChapterQuestions(chapterId, count) {
  try {
    return questionLoader.getRandomQuestions(chapterId, count, true);
  } catch (error) {
    console.error(`Error loading random questions for ${chapterId}:`, error);
    return [];
  }
}

/**
 * Get a complete chapter object with questions
 * Compatible with old INITIAL_DATA format
 * 
 * @param {string} chapterId - Chapter ID
 * @param {boolean} shuffleQuestions - Whether to shuffle questions
 * @returns {Object} - Chapter with questions
 */
export function getChapterWithQuestions(chapterId, shuffleQuestions = true) {
  try {
    const chapter = questionLoader.getChapter(chapterId);
    if (!chapter) {
      console.warn(`Chapter not found: ${chapterId}`);
      return null;
    }
    
    const questions = getChapterQuestions(chapterId, shuffleQuestions);
    
    return {
      id: chapter.id,
      title: chapter.title,
      icon: getIconComponent(chapter.iconName),
      description: chapter.description,
      questions
    };
  } catch (error) {
    console.error(`Error loading chapter ${chapterId}:`, error);
    return null;
  }
}

/**
 * Get all chapters with their questions loaded
 * This is the INITIAL_DATA replacement
 * 
 * WARNING: This can be memory-intensive for large question banks
 * Consider loading questions on-demand instead
 * 
 * @param {boolean} shuffleQuestions - Whether to shuffle questions in each chapter
 * @returns {Array} - All chapters with questions
 */
export function getInitialData(shuffleQuestions = false) {
  const chapters = getAllChapters();
  
  return chapters.map(chapter => {
    const questions = getChapterQuestions(chapter.id, shuffleQuestions);
    return {
      ...chapter,
      questions
    };
  });
}

/**
 * Get question count for a chapter
 * 
 * @param {string} chapterId - Chapter ID
 * @returns {number} - Number of questions
 */
export function getChapterQuestionCount(chapterId) {
  try {
    return questionLoader.getQuestionCount(chapterId);
  } catch (error) {
    console.error(`Error getting question count for ${chapterId}:`, error);
    return 0;
  }
}

/**
 * Convert icon name to icon component
 * @private
 */
function getIconComponent(iconName) {
  const IconComponent = ICON_MAP[iconName] || Brain;
  return <IconComponent className="w-6 h-6" />;
}

/**
 * Get statistics about all questions
 * 
 * @returns {Object} - Question statistics
 */
export function getQuestionStats() {
  try {
    return questionLoader.getStats();
  } catch (error) {
    console.error('Error getting question stats:', error);
    return {
      chapters: 0,
      questionBanks: 0,
      totalQuestions: 0,
      questionsByBank: {}
    };
  }
}

/**
 * BACKWARDS COMPATIBILITY LAYER
 * 
 * This creates a Promise-based version of INITIAL_DATA
 * that can be used with React Suspense or useEffect
 */
export const INITIAL_DATA_PROMISE = (async () => {
  await initializeQuestions();
  return getInitialData();
})();

// Re-export loader for advanced use cases
export { questionLoader };

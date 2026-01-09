/**
 * Chapter Manager
 * 
 * Dynamically loads and manages chapters from JSON configuration.
 * No coding required to add new chapters - just add to chapters.json
 * and create corresponding question file.
 * 
 * HOW TO ADD A NEW CHAPTER:
 * 
 * 1. Add to data/chapters.json:
 *    {
 *      "id": "ch23",
 *      "title": "Ch 23: Your Topic",
 *      "description": "Brief description",
 *      "iconName": "Heart"
 *    }
 * 
 * 2. Create data/ch23-questions.json with questions
 * 
 * 3. Done! Chapter appears automatically in all compatible games
 */

import chaptersConfig from '../config/chapters.json';
import questionLoader from './questionLoader';
import { getIcon } from './gameRegistry';

/**
 * Load all chapters with their questions
 */
export async function loadAllChapters() {
  try {
    // Initialize question loader if not already done
    if (!questionLoader._chapters) {
      await questionLoader.initialize();
    }

    // Map chapter configs to full chapter objects
    const chapters = chaptersConfig.map(chapterConfig => {
      const questions = questionLoader.getQuestionsForChapter(chapterConfig.id);
      
      return {
        id: chapterConfig.id,
        title: chapterConfig.title,
        description: chapterConfig.description,
        icon: getIcon(chapterConfig.iconName),
        IconComponent: getIcon(chapterConfig.iconName),
        questions: questions || [],
        questionCount: questions?.length || 0,
        // Additional metadata
        tags: chapterConfig.tags || [],
        difficulty: chapterConfig.difficulty || 'intermediate',
        estimatedTime: chapterConfig.estimatedTime || Math.ceil((questions?.length || 0) * 1.5), // 1.5 min per question
      };
    });

    return chapters;
  } catch (error) {
    console.error('Failed to load chapters:', error);
    return [];
  }
}

/**
 * Load a single chapter by ID
 */
export async function loadChapter(chapterId) {
  const chapters = await loadAllChapters();
  return chapters.find(ch => ch.id === chapterId);
}

/**
 * Get chapter metadata only (no questions)
 */
export function getChapterMetadata() {
  return chaptersConfig.map(ch => ({
    ...ch,
    IconComponent: getIcon(ch.iconName)
  }));
}

/**
 * Add custom chapter dynamically (from instructor mode, etc.)
 */
export function registerCustomChapter(chapterData) {
  // Store in localStorage for persistence
  const customChapters = getCustomChapters();
  customChapters.push({
    ...chapterData,
    id: chapterData.id || `custom-${Date.now()}`,
    isCustom: true,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('customChapters', JSON.stringify(customChapters));
  return customChapters;
}

/**
 * Get custom chapters created by instructors
 */
export function getCustomChapters() {
  try {
    const stored = localStorage.getItem('customChapters');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get all chapters (standard + custom)
 */
export async function getAllChapters() {
  const standard = await loadAllChapters();
  const custom = getCustomChapters();
  return [...standard, ...custom];
}

/**
 * Validate chapter structure
 */
export function validateChapter(chapter) {
  const errors = [];
  
  if (!chapter.id) errors.push('Missing chapter ID');
  if (!chapter.title) errors.push('Missing chapter title');
  if (!chapter.questions || chapter.questions.length === 0) {
    errors.push('Chapter has no questions');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  loadAllChapters,
  loadChapter,
  getChapterMetadata,
  registerCustomChapter,
  getCustomChapters,
  getAllChapters,
  validateChapter
};

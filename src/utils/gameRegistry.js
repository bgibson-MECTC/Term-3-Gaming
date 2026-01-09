/**
 * Game Registry System
 * 
 * Dynamically loads and manages different game modes without hardcoding.
 */

import { 
  GraduationCap, 
  Scale, 
  Zap, 
  Crown, 
  BookOpen, 
  Brain, 
  Trophy, 
  Users,
  Shield,
  AlertCircle,
  Activity,
  Bug,
  Bone,
  Heart,
  Syringe,
  Stethoscope,
  Hospital,
  Pill,
  Calculator,
  CreditCard
} from 'lucide-react';

import { gamesConfig } from '../config/gamesRegistry';

// Icon mapping for dynamic loading
const ICON_MAP = {
  'GraduationCap': GraduationCap,
  'Scale': Scale,
  'Zap': Zap,
  'Crown': Crown,
  'BookOpen': BookOpen,
  'Brain': Brain,
  'Trophy': Trophy,
  'Users': Users,
  'Shield': Shield,
  'AlertCircle': AlertCircle,
  'Activity': Activity,
  'Bug': Bug,
  'Bone': Bone,
  'Heart': Heart,
  'Syringe': Syringe,
  'Stethoscope': Stethoscope,
  'Hospital': Hospital,
  'Pill': Pill,
  'Calculator': Calculator,
  'CreditCard': CreditCard
};

/**
 * Get icon component from string name
 */
export function getIcon(iconName) {
  return ICON_MAP[iconName] || Brain; // Default fallback
}

/**
 * Get all enabled games
 */
export function getAvailableGames() {
  if (!gamesConfig || !gamesConfig.games) {
    console.warn('Games config not loaded');
    return [];
  }
  
  return gamesConfig.games
    .filter(game => game.enabled)
    .map(game => ({
      ...game,
      IconComponent: getIcon(game.icon)
    }));
}

/**
 * Get games by category
 */
export function getGamesByCategory(categoryId) {
  return getAvailableGames().filter(game => game.category === categoryId);
}

/**
 * Get all categories
 */
export function getCategories() {
  if (!gamesConfig || !gamesConfig.categories) {
    console.warn('Categories config not loaded');
    return [];
  }
  
  return gamesConfig.categories.map(cat => ({
    ...cat,
    IconComponent: getIcon(cat.icon),
    games: getGamesByCategory(cat.id)
  }));
}

/**
 * Get specific game config
 */
export function getGameConfig(gameId) {
  const game = gamesConfig.games.find(g => g.id === gameId);
  if (!game) return null;
  
  return {
    ...game,
    IconComponent: getIcon(game.icon)
  };
}

/**
 * Get all games with their full config
 */
export function getAllGames() {
  return gamesConfig.games.map(game => ({
    ...game,
    IconComponent: getIcon(game.icon)
  }));
}

/**
 * Check if game supports dynamic chapters
 */
export function supportsDynamicChapters(gameId) {
  const game = getGameConfig(gameId);
  return game?.supportsDynamicChapters || false;
}

export default {
  getAvailableGames,
  getAllGames,
  getGamesByCategory,
  getCategories,
  getGameConfig,
  supportsDynamicChapters,
  getIcon
};

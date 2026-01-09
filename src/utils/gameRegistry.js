/**
 * Game Registry System
 * 
 * Dynamically loads and manages different game modes without hardcoding.
 * Add new games by:
 * 1. Adding entry to data/games-registry.json
 * 2. Creating game component (optional - can reuse existing)
 * 3. Registry automatically loads it
 */

import gamesConfig from '../config/games-registry.json';
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
  Calculator
} from 'lucide-react';

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
  'Calculator': Calculator
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
 * Check if game supports dynamic chapters
 */
export function supportsDynamicChapters(gameId) {
  const game = getGameConfig(gameId);
  return game?.supportsDynamicChapters || false;
}

export default {
  getAvailableGames,
  getGamesByCategory,
  getCategories,
  getGameConfig,
  supportsDynamicChapters,
  getIcon
};

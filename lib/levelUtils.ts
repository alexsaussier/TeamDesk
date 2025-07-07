import { ConsultantLevelDefinition } from '@/types'

/**
 * Resolves a level ID to its human-readable name
 * @param levelId - The level ID (e.g., "senior_consultant")
 * @param levels - Array of organization level definitions
 * @returns Human-readable level name (e.g., "Senior Consultant")
 */
export function getLevelName(levelId: string, levels: ConsultantLevelDefinition[]): string {
  const level = levels.find(l => l.id === levelId)
  return level ? level.name : levelId.replace(/_/g, ' ')
}

/**
 * Hook-like function that returns a getLevelName function bound to the provided levels
 * @param levels - Array of organization level definitions
 * @returns Function that takes levelId and returns level name
 */
export function createLevelNameResolver(levels: ConsultantLevelDefinition[]) {
  return (levelId: string) => getLevelName(levelId, levels)
} 
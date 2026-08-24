/**
 * Difficulty Manager
 * Manages progressive difficulty scaling based on initial setting + level progress
 */

export type DifficultyLevel = "Easy" | "Normal" | "Hard" | "Expert" | "Master";

const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  "Easy",
  "Normal",
  "Hard",
  "Expert",
  "Master",
];
const DIFFICULTY_LEVEL_SET = new Set<string>(DIFFICULTY_LEVELS);

const DIFFICULTY_START_LEVELS: Record<
  DifficultyLevel,
  Record<DifficultyLevel, number>
> = {
  Easy: { Easy: 0, Normal: 40, Hard: 70, Expert: 85, Master: 95 },
  Normal: { Easy: 0, Normal: 0, Hard: 30, Expert: 60, Master: 85 },
  Hard: { Easy: 0, Normal: 0, Hard: 0, Expert: 25, Master: 60 },
  Expert: { Easy: 0, Normal: 0, Hard: 0, Expert: 0, Master: 20 },
  Master: { Easy: 0, Normal: 0, Hard: 0, Expert: 0, Master: 0 },
};

const DIFFICULTY_MULTIPLIERS: Record<DifficultyLevel, number> = {
  Easy: 0.6,
  Normal: 1,
  Hard: 1.35,
  Expert: 1.65,
  Master: 2,
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Easy: "#4ade80",
  Normal: "#60a5fa",
  Hard: "#fbbf24",
  Expert: "#f97316",
  Master: "#ef4444",
};

function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === "string" && DIFFICULTY_LEVEL_SET.has(value);
}

/**
Cache the starting difficulty so we don't read localStorage every call
*/
const difficultyCache: { starting: DifficultyLevel | null } = {
  starting: null,
};

/**
 * Get the starting difficulty from settings (cached after first read)
 */
export function getStartingDifficulty(): DifficultyLevel {
  if (difficultyCache.starting) return difficultyCache.starting;
  try {
    const savedSettings = localStorage.getItem("game-settings");
    if (savedSettings) {
      const settings: unknown = JSON.parse(savedSettings);
      if (
        typeof settings === "object" &&
        settings !== null &&
        "difficulty" in settings &&
        isDifficultyLevel(settings.difficulty)
      ) {
        difficultyCache.starting = settings.difficulty;
        return difficultyCache.starting;
      }
    }
  } catch {
    // Fall through to default
  }
  difficultyCache.starting = "Normal";
  return difficultyCache.starting;
}

/**
 * Invalidate the cached starting difficulty (call when settings change)
 */
export function invalidateDifficultyCache(): void {
  difficultyCache.starting = null;
}

/**
 * Calculate current difficulty level based on starting difficulty + level progress
 * The game progressively gets harder as levels increase
 *
 * @param level - Current game level (1-100)
 * @param startingDifficulty - Initial difficulty from settings
 * @returns Current difficulty level
 */
export function getCurrentDifficulty(
  level: number,
  startingDifficulty?: DifficultyLevel,
): DifficultyLevel {
  const starting = startingDifficulty ?? getStartingDifficulty();

  const progression = DIFFICULTY_START_LEVELS[starting];

  if (level >= progression.Master) return "Master";
  if (level >= progression.Expert) return "Expert";
  if (level >= progression.Hard) return "Hard";
  if (level >= progression.Normal) return "Normal";
  return "Easy";
}

/**
 * Get difficulty multiplier for enemy speed/spawning
 * This multiplier increases as difficulty progresses
 *
 * @param currentDifficulty - The current difficulty level
 * @returns Speed multiplier (0.6 to 2.0)
 */
export function getDifficultyMultiplier(
  currentDifficulty: DifficultyLevel,
): number {
  return DIFFICULTY_MULTIPLIERS[currentDifficulty];
}

/**
 * Get display color for difficulty level
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  return DIFFICULTY_COLORS[difficulty];
}

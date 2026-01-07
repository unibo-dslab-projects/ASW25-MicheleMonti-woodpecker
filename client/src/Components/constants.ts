export const DIFFICULTY_RANGES = {
    easy: { min: 1, max: 222 },
    medium: { min: 223, max: 984 },
    hard: { min: 985, max: 1128 }
} as const;

export type Difficulty = keyof typeof DIFFICULTY_RANGES;
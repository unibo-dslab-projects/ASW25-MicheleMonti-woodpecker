import { PieceType, DeskCell, BoardCell, SideCell, PieceKind, PieceColor } from '../../defs';

export type { 
  PieceType, 
  DeskCell, 
  BoardCell, 
  SideCell, 
  PieceKind, 
  PieceColor 
};

import { Difficulty } from '../constants';

export type { Difficulty };

export interface PuzzleData {
  board: any;
  index: number;
  boardFromFen: Map<DeskCell, PieceType>;
  direction: string;
  description: string;
  solution: string;
}

export interface UserEvaluation {
  puzzleId: number;
  evaluation: string;
}

export interface UserStats {
  totalPuzzles: number;
  solvedCount: number;
  partialCount: number;
  failedCount: number;
  successRate: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface RecentEvaluation {
  puzzleId: string;
  evaluation: string;
  puzzle: {
    descr: string;
    fen: string;
    direction: string;
    solution: string;
  } | null;
  timestamp?: string;
}

export type BoardState = Map<DeskCell, PieceType>;
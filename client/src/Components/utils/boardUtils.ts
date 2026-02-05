import { BoardCell, PieceType, SideCell } from "../../defs";
import { Difficulty, DIFFICULTY_RANGES } from "../constants";
import { BoardState } from "../types";

export const SIDE_CELLS_MAP = new Map<SideCell, PieceType>([
  ['w1', new PieceType('rook', 'white')],
  ['w2', new PieceType('king', 'white')],
  ['w3', new PieceType('knight', 'white')],
  ['w4', new PieceType('queen', 'white')],
  ['w5', new PieceType('bishop', 'white')],
  ['w6', new PieceType('pawn', 'white')],
  ['b1', new PieceType('bishop', 'black')],
  ['b2', new PieceType('pawn', 'black')],
  ['b3', new PieceType('knight', 'black')],
  ['b4', new PieceType('queen', 'black')],
  ['b5', new PieceType('rook', 'black')],
  ['b6', new PieceType('king', 'black')],
]);

export function fenToBoardMap(fen: string): Map<BoardCell, PieceType> {
  const boardMap = new Map<BoardCell, PieceType>();
  const rows = fen.split('/');
  const pieceMap: { 
    [key: string]: { 
      type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn', 
      color: 'white' | 'black' 
    } 
  } = {
    'p': { type: 'pawn', color: 'black' },
    'r': { type: 'rook', color: 'black' },
    'n': { type: 'knight', color: 'black' },
    'b': { type: 'bishop', color: 'black' },
    'q': { type: 'queen', color: 'black' },
    'k': { type: 'king', color: 'black' },
    'P': { type: 'pawn', color: 'white' },
    'R': { type: 'rook', color: 'white' },
    'N': { type: 'knight', color: 'white' },
    'B': { type: 'bishop', color: 'white' },
    'Q': { type: 'queen', color: 'white' },
    'K': { type: 'king', color: 'white' },
  };

  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (const char of row) {
      if (isNaN(Number(char))) {
        const piece = pieceMap[char];
        if (piece) {
          const cell = `${String.fromCharCode(65 + colIndex)}${8 - rowIndex}` as BoardCell;
          boardMap.set(cell, new PieceType(piece.type, piece.color));
        }
        colIndex++;
      } else {
        colIndex += Number(char);
      }
    }
  });

  return boardMap;
}

export function getFallbackBoard(difficulty: Difficulty = 'easy') {
  const range = DIFFICULTY_RANGES[difficulty];
  const randomIndex = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  return {
    board: null,
    index: randomIndex,
    boardFromFen: new Map<BoardCell, PieceType>(),
    direction: 'w',
    description: 'Loading puzzle...',
    solution: 'Solution will appear here'
  };
}

export const getDifficultyFromPuzzleId = (puzzleId: number): Difficulty => {
  if (puzzleId >= 1 && puzzleId <= 222) return 'easy';
  if (puzzleId >= 223 && puzzleId <= 984) return 'medium';
  return 'hard';
};

export const isSideCell = (cell: string, 
  whiteSideCells: readonly string[], 
  blackSideCells: readonly string[]
): boolean => {
  return whiteSideCells.includes(cell) || blackSideCells.includes(cell);
};

export const createFreshBoardState = (
  boardFromFen: Map<BoardCell, PieceType>, 
  sideCellsMap: Map<SideCell, PieceType>
): BoardState => {
  return new Map([...boardFromFen, ...sideCellsMap]);
};

export const getEvaluationInfo = (evaluation: string) => {
  switch (evaluation) {
    case 'solved': 
      return { text: 'Solved', color: 'text-neutral-900' };
    case 'partial': 
      return { text: 'Partial', color: 'text-neutral-900' };
    case 'failed': 
      return { text: 'Failed', color: 'text-neutral-900' };
    default: 
      return { text: evaluation, color: 'text-neutral-600' };
  }
};

export const getDifficultyInfo = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': 
      return { color: 'text-neutral-900', label: 'Easy' };
    case 'medium': 
      return { color: 'text-neutral-900', label: 'Medium' };
    case 'hard': 
      return { color: 'text-neutral-900', label: 'Hard' };
    default: 
      return { color: 'text-neutral-500', label: difficulty };
  }
};

export const getDifficultyWithLabel = (puzzleId: number | string) => {
  const id = typeof puzzleId === 'string' ? parseInt(puzzleId) : puzzleId;
  
  if (isNaN(id)) return { difficulty: 'Unknown', label: 'Unknown' };
  
  if (id >= 1 && id <= 222) return { difficulty: 'easy', label: 'Easy' };
  if (id >= 223 && id <= 984) return { difficulty: 'medium', label: 'Medium' };
  if (id >= 985 && id <= 1128) return { difficulty: 'hard', label: 'Hard' };
  
  return { difficulty: 'Unknown', label: 'Unknown' };
};

export const generateRoomId = (): string => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
};

export const getPuzzleIdFromSearchParams = (searchParams: URLSearchParams): number => {
  const puzzleId = parseInt(searchParams.get('puzzleId') || '1');
  return isNaN(puzzleId) ? 1 : puzzleId;
};
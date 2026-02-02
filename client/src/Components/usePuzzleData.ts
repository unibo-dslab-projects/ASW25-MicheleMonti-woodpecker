import { useState } from 'react';
import { DeskCell, PieceType } from '../defs';
import { getRandomBoardFromAPI, getPuzzleByIdFromAPI } from './utils/apiUtils';
import { SIDE_CELLS_MAP } from './utils/boardUtils';
import { Difficulty } from './constants';

interface PuzzleData {
  board: Map<DeskCell, PieceType>;
  index: number;
  boardFromFen: Map<DeskCell, PieceType>;
  direction: string;
  description: string;
  solution: string;
}

export function usePuzzleData() {
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [board, setBoard] = useState<Map<DeskCell, PieceType>>(new Map([...SIDE_CELLS_MAP]));
  const [description, setDescription] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const [direction, setDirection] = useState<string>('w');
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadNewPuzzle = async (difficulty: Difficulty) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const newPuzzleData = await getRandomBoardFromAPI(difficulty);
      updatePuzzleData(newPuzzleData);
    } catch (error) {
      setError('Failed to load puzzle. Please try again.');
      console.error('Error loading puzzle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecificPuzzle = async (puzzleId: number) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const newPuzzleData = await getPuzzleByIdFromAPI(puzzleId);
      updatePuzzleData(newPuzzleData);
    } catch (error) {
      setError('Failed to load puzzle. Please try again.');
      console.error('Error loading puzzle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePuzzleData = (newPuzzleData: PuzzleData) => {
    setPuzzleData(newPuzzleData);
    setDescription(newPuzzleData.description);
    setBoard(new Map([...newPuzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
    setDirection(newPuzzleData.direction);
    setSolution(newPuzzleData.solution);
    setPuzzleIndex(newPuzzleData.index);
  };

  const restartPuzzle = () => {
    if (puzzleData) {
      setBoard(new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
    }
  };

  return {
    puzzleData,
    board,
    setBoard,
    description,
    solution,
    direction,
    puzzleIndex,
    error,
    isLoading,
    loadNewPuzzle,
    loadSpecificPuzzle,
    restartPuzzle,
    setError,
    setIsLoading
  };
}
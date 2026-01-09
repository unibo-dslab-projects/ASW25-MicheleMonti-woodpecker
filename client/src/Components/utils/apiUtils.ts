import { Difficulty } from "../constants";
import { fenToBoardMap, getFallbackBoard } from "./boardUtils";
import { BoardCell, PieceType } from "../../defs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
console.log('API Base URL:', API_BASE_URL);

export async function getRandomBoardFromAPI(difficulty: Difficulty = 'easy'): Promise<{
    board: any,
    index: number,
    boardFromFen: Map<BoardCell, PieceType>,
    direction: string,
    description: string,
    solution: string
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/puzzles/random/${difficulty}`);
        if (!response.ok) throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
        
        const randomBoard = await response.json();
        let fen = randomBoard.fen;
        try { fen = decodeURIComponent(fen); } catch (e) {}
        
        return {
            board: randomBoard,
            index: randomBoard.puzzle_id,
            boardFromFen: fenToBoardMap(fen),
            direction: randomBoard.direction,
            description: randomBoard.descr,
            solution: randomBoard.solution || 'No solution available'
        };
    } catch (error) {
        console.error('Error fetching puzzle from API:', error);
        return getFallbackBoard(difficulty);
    }
}
import { BoardCell, PieceType, SideCell } from "../../defs";
import { Difficulty, DIFFICULTY_RANGES } from "../constants";

export const SIDE_CELLS_MAP = new Map<SideCell, PieceType>([
    ['w1', new PieceType('rook', 'white')], ['w2', new PieceType('king', 'white')], ['w3', new PieceType('knight', 'white')], ['w4', new PieceType('queen', 'white')], ['w5', new PieceType('bishop', 'white')], ['w6', new PieceType('pawn', 'white')],
    ['b1', new PieceType('bishop', 'black')], ['b2', new PieceType('pawn', 'black')], ['b3', new PieceType('knight', 'black')], ['b4', new PieceType('queen', 'black')], ['b5', new PieceType('rook', 'black')], ['b6', new PieceType('king', 'black')],
]);

export function fenToBoardMap(fen: string): Map<BoardCell, PieceType> {
    const boardMap = new Map<BoardCell, PieceType>();
    const rows = fen.split('/');
    const pieceMap: { [key: string]: { type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn', color: 'white' | 'black' } } = {
        'p': { type: 'pawn', color: 'black' }, 'r': { type: 'rook', color: 'black' }, 'n': { type: 'knight', color: 'black' },
        'b': { type: 'bishop', color: 'black' }, 'q': { type: 'queen', color: 'black' }, 'k': { type: 'king', color: 'black' },
        'P': { type: 'pawn', color: 'white' }, 'R': { type: 'rook', color: 'white' }, 'N': { type: 'knight', color: 'white' },
        'B': { type: 'bishop', color: 'white' }, 'Q': { type: 'queen', color: 'white' }, 'K': { type: 'king', color: 'white' },
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
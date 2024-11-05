export const PIECES_KINDS = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const;
export const PIECES_COLORS = ['white', 'black'] as const;
export const CELLS = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8',
] as const;

export const PIECES: Record<string, PieceType> = {
    WHITE_KING: {type: 'king', color: 'white'},
    WHITE_QUEEN: {type: 'queen', color: 'white'},
    WHITE_ROOK: {type: 'rook', color: 'white'},
    WHITE_BISHOP: {type: 'bishop', color: 'white'},
    WHITE_KNIGHT: {type: 'knight', color: 'white'},
    WHITE_PAWN: {type: 'pawn', color: 'white'},
    BLACK_KING: {type: 'king', color: 'black'},
    BLACK_QUEEN: {type: 'queen', color: 'black'},
    BLACK_ROOK: {type: 'rook', color: 'black'},
    BLACK_BISHOP: {type: 'bishop', color: 'black'},
    BLACK_KNIGHT: {type: 'knight', color: 'black'},
    BLACK_PAWN: {type: 'pawn', color: 'black'},
} as const;

export type PieceKind = typeof PIECES_KINDS[number];
export type PieceColor = typeof PIECES_COLORS[number];
export type BoardCell = typeof CELLS[number];

export type PieceType = {type: PieceKind, color: PieceColor};
export type BoardType = Record<BoardCell, PieceType>;

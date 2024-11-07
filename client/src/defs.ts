export const PIECES_KINDS = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const;
export const PIECES_COLORS = ['white', 'black'] as const;
export const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
export const BOARD_CELLS = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8',
] as const;

export const WHITE_SIDE_CELLS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'] as const;
export const BLACK_SIDE_CELLS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const;

export type PieceKind = typeof PIECES_KINDS[number];
export type PieceColor = typeof PIECES_COLORS[number];
export type BoardCell = typeof BOARD_CELLS[number];
export type SideCell = typeof WHITE_SIDE_CELLS[number] | typeof BLACK_SIDE_CELLS[number];
export type DeskCell = BoardCell | SideCell;

export class PieceType {
    constructor(public type: PieceKind, public color: PieceColor) {}
}

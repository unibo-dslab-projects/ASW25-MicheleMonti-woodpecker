import { useState } from "react";
import { BoardCell, CELLS, COLUMNS, PieceColor, PIECES, PieceType, ROWS } from "../defs";
import Piece from "./Piece";
import Square from "./Square";

const DEFAULT_BOARD = new Map<BoardCell, PieceType>([
    ['A1', PIECES.WHITE_ROOK], ['B1', PIECES.WHITE_KNIGHT], ['C1', PIECES.WHITE_BISHOP], ['D1', PIECES.WHITE_QUEEN], ['E1', PIECES.WHITE_KING], ['F1', PIECES.WHITE_BISHOP], ['G1', PIECES.WHITE_KNIGHT], ['H1', PIECES.WHITE_ROOK],
    ['A2', PIECES.WHITE_PAWN], ['B2', PIECES.WHITE_PAWN], ['C2', PIECES.WHITE_PAWN], ['D2', PIECES.WHITE_PAWN], ['E2', PIECES.WHITE_PAWN], ['F2', PIECES.WHITE_PAWN], ['G2', PIECES.WHITE_PAWN], ['H2', PIECES.WHITE_PAWN],
    ['A7', PIECES.BLACK_PAWN], ['B7', PIECES.BLACK_PAWN], ['C7', PIECES.BLACK_PAWN], ['D7', PIECES.BLACK_PAWN], ['E7', PIECES.BLACK_PAWN], ['F7', PIECES.BLACK_PAWN], ['G7', PIECES.BLACK_PAWN], ['H7', PIECES.BLACK_PAWN],
    ['A8', PIECES.BLACK_ROOK], ['B8', PIECES.BLACK_KNIGHT], ['C8', PIECES.BLACK_BISHOP], ['D8', PIECES.BLACK_QUEEN], ['E8', PIECES.BLACK_KING], ['F8', PIECES.BLACK_BISHOP], ['G8', PIECES.BLACK_KNIGHT], ['H8', PIECES.BLACK_ROOK],
]);

function getCellColor(cell: BoardCell): PieceColor {
    const column = cell[0];
    const row = parseInt(cell[1]);
    const isEvenColumn = 'ACEG'.includes(column);
    return (isEvenColumn && row % 2 === 0) || (!isEvenColumn && row % 2 !== 0) ? 'white' : 'black';
}

export default function Board() {
    const [board, setBoard] = useState(DEFAULT_BOARD);
    const [selectedCell, setSelectedCell] = useState<BoardCell | null>(null);

    function onSelectedCell(cell: BoardCell) {
        if (selectedCell) {
            const piece = board.get(selectedCell);
            if (!piece)
                return;
            const newBoard = new Map(board);
            newBoard.set(cell, piece);
            newBoard.delete(selectedCell);
            setBoard(newBoard);
            setSelectedCell(null);
        } else if (board.has(cell)) {
            setSelectedCell(cell);
        }
    }
    
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="relative">
                <div className="grid chess-board-grid-area w-[36w] h-[36vw] rounded-lg overflow-hidden">
                    <div className="contents">
                        {CELLS.map(cell =>
                            <Square key={cell} name={cell} color={getCellColor(cell)} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell} />
                        )}
                    </div>
                    <div className="contents">
                        {[...DEFAULT_BOARD].map(([cell, piece]) => 
                            <Piece key={cell} piece={piece} cell={cell} />
                        )}
                        <div className="contents">
                            {COLUMNS.map(c =>
                                <div key={c} style={{ gridArea: `r${c}`, color: 'gray' }} className="flex justify-center rounded-lg items-center">{c.toLowerCase()}</div>
                            )}
                        </div>
                        <div className="contents">
                            {ROWS.map(r =>
                                <div key={r} style={{ gridArea: `r${r}`, color: 'gray', padding: '0.5rem' }} className="flex justify-center items-center">{r}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
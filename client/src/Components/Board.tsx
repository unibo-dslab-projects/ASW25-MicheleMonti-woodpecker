import { useRef, useState } from "react";
import { BoardCell, CELLS, COLUMNS, PieceColor, PieceType, ROWS } from "../defs";
import Piece from "./Piece";
import Square from "./Square";

const DEFAULT_BOARD = new Map<BoardCell, PieceType>([
    ['A1', new PieceType('rook', 'white')], ['B1', new PieceType('knight', 'white')], ['C1', new PieceType('bishop', 'white')], ['D1', new PieceType('queen', 'white')], ['E1', new PieceType('king', 'white')], ['F1', new PieceType('bishop', 'white')], ['G1', new PieceType('knight', 'white')], ['H1', new PieceType('rook', 'white')],
    ['A2', new PieceType('pawn', 'white')], ['B2', new PieceType('pawn', 'white')], ['C2', new PieceType('pawn', 'white')], ['D2', new PieceType('pawn', 'white')], ['E2', new PieceType('pawn', 'white')], ['F2', new PieceType('pawn', 'white')], ['G2', new PieceType('pawn', 'white')], ['H2', new PieceType('pawn', 'white')],
    ['A7', new PieceType('pawn', 'black')], ['B7', new PieceType('pawn', 'black')], ['C7', new PieceType('pawn', 'black')], ['D7', new PieceType('pawn', 'black')], ['E7', new PieceType('pawn', 'black')], ['F7', new PieceType('pawn', 'black')], ['G7', new PieceType('pawn', 'black')], ['H7', new PieceType('pawn', 'black')],
    ['A8', new PieceType('rook', 'black')], ['B8', new PieceType('knight', 'black')], ['C8', new PieceType('bishop', 'black')], ['D8', new PieceType('queen', 'black')], ['E8', new PieceType('king', 'black')], ['F8', new PieceType('bishop', 'black')], ['G8', new PieceType('knight', 'black')], ['H8', new PieceType('rook', 'black')],
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

    const nextKey = useRef(1);
    const keyMap = useRef(new WeakMap<PieceType, number>());
    function getPieceKey(piece: PieceType) {
        if (!keyMap.current.has(piece)) {
            keyMap.current.set(piece, nextKey.current++);
        }
        return keyMap.current.get(piece);
    }

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
                        {[...board].map(([cell, piece]) => 
                            <Piece key={getPieceKey(piece)} piece={piece} cell={cell} />
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
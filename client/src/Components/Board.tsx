import Piece from "./Piece";
import Square from "./Square";

const CELLS = [1, 2, 3, 4, 5, 6, 7, 8].reverse().flatMap(c => 'ABCDEFGH'.split('').map(r => r + c));
const DEFAULT_BOARD = {
    A8: {type: 'rook', color: 'black'}, B8: {type: 'knight', color: 'black'}, C8: {type: 'bishop', color: 'black'}, D8: {type: 'queen', color: 'black'}, E8: {type: 'king', color: 'black'}, F8: {type: 'bishop', color: 'black'}, G8: {type: 'knight', color: 'black'}, H8: {type: 'rook', color: 'black'},
    A7: {type: 'pawn', color: 'black'}, B7: {type: 'pawn', color: 'black'}, C7: {type: 'pawn', color: 'black'}, D7: {type: 'pawn', color: 'black'}, E7: {type: 'pawn', color: 'black'}, F7: {type: 'pawn', color: 'black'}, G7: {type: 'pawn', color: 'black'}, H7: {type: 'pawn', color: 'black'},
    A2: {type: 'pawn', color: 'white'}, B2: {type: 'pawn', color: 'white'}, C2: {type: 'pawn', color: 'white'}, D2: {type: 'pawn', color: 'white'}, E2: {type: 'pawn', color: 'white'}, F2: {type: 'pawn', color: 'white'}, G2: {type: 'pawn', color: 'white'}, H2: {type: 'pawn', color: 'white'},
    A1: {type: 'rook', color: 'white'}, B1: {type: 'knight', color: 'white'}, C1: {type: 'bishop', color: 'white'}, D1: {type: 'queen', color: 'white'}, E1: {type: 'king', color: 'white'}, F1: {type: 'bishop', color: 'white'}, G1: {type: 'knight', color: 'white'}, H1: {type: 'rook', color: 'white'},
}

function getCellColor(cell) {
    const column = cell[0];
    const row = parseInt(cell[1]);
    const isEvenColumn = 'ACEG'.includes(column);
    return (isEvenColumn && row % 2 === 0) || (!isEvenColumn && row % 2 !== 0) ? 'white' : 'black';
}

export default function Board() {
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const rows = [8, 7, 6, 5, 4, 3, 2, 1];

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="relative">
                <div className="absolute left-[-20px] top-0 h-full flex flex-col justify-between py-2">
                    {rows.map((row) => (
                        <span key={row} className="text-center text-gray-700">{row}</span>
                    ))}
                </div>
                <div className="grid chess-board-grid-area w-[400px] h-[400px] rounded-lg overflow-hidden">
                    <div className="contents">
                        {CELLS.map(cell => (
                            <Square key={cell} name={cell} color={getCellColor(cell)} />
                        ))}
                    </div>
                    <div className="contents">
                        {Object.entries(DEFAULT_BOARD).map(([cell, piece]) => 
                            <Piece key={cell} type={piece.type} color={piece.color} cell={cell} />
                        )}
                    </div>
                </div>
                <div className="absolute bottom-[-20px] left-0 w-full flex justify-between px-2">
                    {columns.map((col) => (
                        <span key={col} className="text-center text-gray-700">{col}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
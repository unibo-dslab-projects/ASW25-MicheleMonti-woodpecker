import Piece from "./Piece";
import Square from "./Square";

const CELLS = [1, 2, 3, 4, 5, 6, 7, 8].reverse().flatMap(c => 'ABCDEFGH'.split('').map(r => r + c));
const DEFAULT_BOARD = {
    A8: {type: 'rook', color: 'black'}, B8: {type: 'knight', color: 'black'}, C8: {type: 'bishop', color: 'black'}, D8: {type: 'queen', color: 'black'}, E8: {type: 'king', color: 'black'}, F8: {type: 'bishop', color: 'black'}, G8: {type: 'knight', color: 'black'}, H8: {type: 'rook', color: 'black'},
    A7: {type: 'pawn', color: 'black'}, B7: {type: 'pawn', color: 'black'}, C7: {type: 'pawn', color: 'black'}, D7: {type: 'pawn', color: 'black'}, E7: {type: 'pawn', color: 'black'}, F7: {type: 'pawn', color: 'black'}, G7: {type: 'pawn', color: 'black'}, H7: {type: 'pawn', color: 'black'},
    A2: {type: 'pawn', color: 'white'}, B2: {type: 'pawn', color: 'white'}, C2: {type: 'pawn', color: 'white'}, D2: {type: 'pawn', color: 'white'}, E2: {type: 'pawn', color: 'white'}, F2: {type: 'pawn', color: 'white'}, G2: {type: 'pawn', color: 'white'}, H2: {type: 'pawn', color: 'white'},
    A1: {type: 'rook', color: 'white'}, B1: {type: 'knight', color: 'white'}, C1: {type: 'bishop', color: 'white'}, D1: {type: 'queen', color: 'white'}, E1: {type: 'king', color: 'white'}, F1: {type: 'bishop', color: 'white'}, G1: {type: 'knight', color: 'white'}, H1: {type: 'rook', color: 'white'},
}

export default function Board() {
    return <div className="grid chess-board-grid-area">
        <div className="contents">
            {CELLS.map(cell => <Square key={cell} name={cell} />)}
        </div>
        <div className="contents">
            {Object.entries(DEFAULT_BOARD).map(([cell, piece]) => 
                <Piece key={cell} type={piece.type} color={piece.color} cell={cell} />
            )}
        </div>
    </div>;
}
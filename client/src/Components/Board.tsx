import woodpeckerBoards from '../woodpecker_boards.json';
import { useEffect, useRef, useState } from "react";
import { BoardCell, DeskCell, BOARD_CELLS, COLUMNS, PieceType, ROWS, SideCell, WHITE_SIDE_CELLS, BLACK_SIDE_CELLS } from "../defs";
import Piece from "./Piece";
import Square from "./Square";

/*const DEFAULT_BOARD = new Map<BoardCell, PieceType>([
    ['A1', new PieceType('rook', 'white')], ['B1', new PieceType('knight', 'white')], ['C1', new PieceType('bishop', 'white')], ['D1', new PieceType('queen', 'white')], ['E1', new PieceType('king', 'white')], ['F1', new PieceType('bishop', 'white')], ['G1', new PieceType('knight', 'white')], ['H1', new PieceType('rook', 'white')],
    ['A2', new PieceType('pawn', 'white')], ['B2', new PieceType('pawn', 'white')], ['C2', new PieceType('pawn', 'white')], ['D2', new PieceType('pawn', 'white')], ['E2', new PieceType('pawn', 'white')], ['F2', new PieceType('pawn', 'white')], ['G2', new PieceType('pawn', 'white')], ['H2', new PieceType('pawn', 'white')],
    ['A7', new PieceType('pawn', 'black')], ['B7', new PieceType('pawn', 'black')], ['C7', new PieceType('pawn', 'black')], ['D7', new PieceType('pawn', 'black')], ['E7', new PieceType('pawn', 'black')], ['F7', new PieceType('pawn', 'black')], ['G7', new PieceType('pawn', 'black')], ['H7', new PieceType('pawn', 'black')],
    ['A8', new PieceType('rook', 'black')], ['B8', new PieceType('knight', 'black')], ['C8', new PieceType('bishop', 'black')], ['D8', new PieceType('queen', 'black')], ['E8', new PieceType('king', 'black')], ['F8', new PieceType('bishop', 'black')], ['G8', new PieceType('knight', 'black')], ['H8', new PieceType('rook', 'black')],
]);*/

const SIDE_CELLS_MAP = new Map<SideCell, PieceType>([
    ['w1', new PieceType('rook', 'white')], ['w2', new PieceType('king', 'white')], ['w3', new PieceType('knight', 'white')], ['w4', new PieceType('queen', 'white')], ['w5', new PieceType('bishop', 'white')], ['w6', new PieceType('pawn', 'white')],
    ['b1', new PieceType('bishop', 'black')], ['b2', new PieceType('pawn', 'black')], ['b3', new PieceType('knight', 'black')], ['b4', new PieceType('queen', 'black')], ['b5', new PieceType('rook', 'black')], ['b6', new PieceType('king', 'black')],
]);


function fenToBoardMap(fen: string): Map<BoardCell, PieceType> {
    const boardMap = new Map<BoardCell, PieceType>();
    const rows = fen.split('/');
    const pieceMap: { [key: string]: { type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn', color: 'white' | 'black' } } = {
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

const boardKeys = Object.keys(woodpeckerBoards);
const randomIndex = Math.floor(Math.random() * boardKeys.length);
const randomBoard = woodpeckerBoards[randomIndex.toString() as keyof typeof woodpeckerBoards];
const boardFromFen = fenToBoardMap(randomBoard.fen);
//const boardNumber = randomIndex;
const initialDirection = randomBoard.direction;
const boardDescription = `${randomBoard.descr}`;
const boardSolution = randomBoard.solution || 'No solution available';

export default function Board() {
    const [description] = useState<string>(boardDescription);
    const [board, setBoard] = useState<Map<DeskCell, PieceType>>(new Map([...boardFromFen, ...SIDE_CELLS_MAP]));
    const [selectedCell, setSelectedCell] = useState<DeskCell | null>(null);
    const [direction] = useState<string>(initialDirection);
    const [solution] = useState<string>(boardSolution);
    const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);

    const gridElement = useRef<HTMLDivElement>(null);

    function isSideCell(cell: DeskCell): boolean {
        return WHITE_SIDE_CELLS.includes(cell as typeof WHITE_SIDE_CELLS[number]) || BLACK_SIDE_CELLS.includes(cell as typeof BLACK_SIDE_CELLS[number]);
    }

    function onSelectedCell(cell: DeskCell) {
        if (selectedCell == cell) {
            setSelectedCell(null);
        } else if (selectedCell) {
            const piece = board.get(selectedCell);
            if (!piece)
                return;
                
            const newBoard = new Map(board);
            const isDestSideCell = isSideCell(cell);
            const isSourceSideCell = isSideCell(selectedCell);
            
            if (isDestSideCell) {
                newBoard.delete(selectedCell);
                if (isSourceSideCell) {
                    newBoard.set(selectedCell, new PieceType(piece.type, piece.color));
                }
            } else {
                newBoard.set(cell, piece);
                newBoard.delete(selectedCell);
                
                if (isSourceSideCell) {
                    newBoard.set(selectedCell, new PieceType(piece.type, piece.color));
                }
            }
            
            setBoard(newBoard);
            setSelectedCell(null);
        } else if (board.has(cell)) {
            setSelectedCell(cell);
        }
    }
    
    useEffect(() => {
        function callback(mutations: MutationRecord[]) {
            let from = null;
            let to = null;
            let piece = null;
            for (const m of mutations) {
                if (m.addedNodes.length) {
                    to = m.target as Element;
                    piece = m.addedNodes[0] as Element;
                } else if (m.removedNodes.length) {
                    from = m.target as Element;
                }
            }
            if (from && to && piece) {
                const rFrom = from.getBoundingClientRect();
                const rTo = to.getBoundingClientRect();
                const dx = rFrom.x - rTo.x;
                const dy = rFrom.y - rTo.y;
                piece.animate([
                    { translate: `${dx}px ${dy}px` },
                    { translate: "0px 0px" },
                ], {
                    duration: 200,
                    easing: "cubic-bezier(0.65, 0, 0.35, 1)"
                })
            }
        }
        if (gridElement.current) {
            new MutationObserver(callback).observe(
                gridElement.current, 
                {subtree: true, childList: true, attributes: false, characterData: false}
            );
        }
      }, []);
    
    function isBold(word: string) {
        if (description[description.split(' ').indexOf(word) + 1] === ',') {
            return true;
        };
        return false;
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black-background p-4">
            <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded border border-gray-700 shadow-sm flex-shrink-0"
                        style={{
                            backgroundColor: direction === 'w' ? 'var(--white-piece-color)' : 'var(--black-piece-color)'
                        }}
                        title={`Next move: ${direction === 'w' ? 'White' : 'Black'}`}
                        aria-label={`Next move: ${direction === 'w' ? 'white' : 'black'}`}
                    />
                    <div className="text-neutral-400 text-center">
                        {description.split(' ').map((word, index) => (
                            <span key={index} className={isBold(word) ? 'font-bold' : ''}>{word} </span>
                        ))}
                    </div>
                </div>
                
                <div ref={gridElement} className="desk-grid-area w-[min(100vh,100vw)] p-3">
                    <div className="board-subgrid checkered-background rounded-lg">
                        {BOARD_CELLS.map(cell =>
                            <Square key={cell} name={cell} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell}>
                                <Piece piece={board.get(cell)} />
                            </Square>
                        )}
                    </div>
                    <div className="white-side-subgrid bg-black-cell rounded-lg">
                        {WHITE_SIDE_CELLS.map(cell =>
                            <Square key={cell} name={cell} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell}>
                                <Piece piece={board.get(cell)} />
                            </Square>
                        )}
                    </div>
                    <div className="black-side-subgrid bg-white-cell rounded-lg">
                        {BLACK_SIDE_CELLS.map(cell =>
                            <Square key={cell} name={cell} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell}>
                                <Piece piece={board.get(cell)} />
                            </Square>
                        )}
                    </div>
                    <div className="contents">
                        {COLUMNS.map(c =>
                            <div key={c} style={{ gridArea: `r${c}` }} className="text-neutral-400 place-self-center">{c.toLowerCase()}</div>
                        )}
                    </div>
                    <div className="contents">
                        {ROWS.map(r =>
                            <div key={r} style={{ gridArea: `r${r}` }} className="text-neutral-400 place-self-center">{r}</div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Solution panel below the board */}
            <div className="w-full max-w-[min(100vh,100vw)] mt-6">
                <div 
                    className={`rounded-lg p-4 cursor-pointer transition-all duration-300 ${isSolutionRevealed ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                    onClick={() => setIsSolutionRevealed(!isSolutionRevealed)}
                >
                    <h3 className="font-bold text-lg mb-3 text-neutral-800 text-center">Solution</h3>
                    {isSolutionRevealed ? (
                        <div 
                            className="text-neutral-800 whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: solution }}
                        />
                    ) : (
                        <div className="text-neutral-600 text-center py-6 text-lg">
                            Click to reveal the solution
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
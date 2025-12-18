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

const DIFFICULTY_RANGES = {
    easy: { min: 1, max: 222 },
    medium: { min: 223, max: 984 },
    hard: { min: 985, max: 1128 }
};

function getRandomBoard(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
    const range = DIFFICULTY_RANGES[difficulty];
    
    const randomIndex = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const randomBoard = woodpeckerBoards[randomIndex.toString() as keyof typeof woodpeckerBoards];
    
    return {
        board: randomBoard,
        index: randomIndex,
        boardFromFen: fenToBoardMap(randomBoard.fen),
        direction: randomBoard.direction,
        description: randomBoard.descr,
        solution: randomBoard.solution || 'No solution available'
    };
}

export default function Board() {
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [puzzleData, setPuzzleData] = useState(() => getRandomBoard(difficulty));
    
    const [description, setDescription] = useState<string>(puzzleData.description);
    const [board, setBoard] = useState<Map<DeskCell, PieceType>>(new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
    const [selectedCell, setSelectedCell] = useState<DeskCell | null>(null);
    const [direction, setDirection] = useState<string>(puzzleData.direction);
    const [solution, setSolution] = useState<string>(puzzleData.solution);
    const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
    const [puzzleIndex, setPuzzleIndex] = useState<number>(puzzleData.index);
    
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
    
    function loadNewPuzzle() {
        const newPuzzleData = getRandomBoard(difficulty);
        setPuzzleData(newPuzzleData);
        setDescription(newPuzzleData.description);
        setBoard(new Map([...newPuzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
        setDirection(newPuzzleData.direction);
        setSolution(newPuzzleData.solution);
        setSelectedCell(null);
        setIsSolutionRevealed(false);
        setPuzzleIndex(newPuzzleData.index);
    }
    
    function restartPuzzle() {
        setBoard(new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
        setSelectedCell(null);
        setIsSolutionRevealed(false);
    }
    
    const getCurrentDifficulty = () => {
        if (puzzleIndex >= 1 && puzzleIndex <= 222) return 'easy';
        if (puzzleIndex >= 223 && puzzleIndex <= 984) return 'medium';
        return 'hard';
    };
    
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full">
                <div 
                    className="order-2 md:order-1 rounded-lg p-4 mb-4 md:mb-0 flex flex-col gap-3"
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                >
                    <div className="mb-2">
                        <h3 className="font-bold text-lg text-center mb-2 text-neutral-800">Difficulty</h3>
                        
                        <div className="flex rounded-lg overflow-hidden border-2 border-gray-700 shadow-sm">
                            {(['easy', 'medium', 'hard'] as const).map((level, index) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`flex-1 px-3 py-2 text-center transition-all duration-200 ${
                                        difficulty === level 
                                            ? 'text-black font-medium' 
                                            : 'text-neutral-700 hover:text-black'
                                    } ${index !== 2 ? 'border-r border-gray-700' : ''}`}
                                    style={{ 
                                        backgroundColor: difficulty === level 
                                            ? 'var(--white-cell-color)' 
                                            : 'var(--black-cell-color)'
                                    }}
                                >
                                    <span className="capitalize">{level}</span>
                                </button>
                            ))}
                        </div>
                        
                        {/* Range indicator below the curtain selector */}
                        <div className="text-xs text-center mt-1 text-neutral-600">
                            {DIFFICULTY_RANGES[difficulty].min}-{DIFFICULTY_RANGES[difficulty].max}
                        </div>
                    </div>
                    
                    <button 
                        onClick={restartPuzzle}
                        className="px-4 py-2 text-black rounded-lg transition-colors whitespace-nowrap hover:opacity-90 w-full"
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                        title="Reset current puzzle to starting position"
                    >
                        Restart Puzzle
                    </button>
                    
                    <button 
                        onClick={loadNewPuzzle}
                        className="px-4 py-2 text-black rounded-lg transition-colors whitespace-nowrap hover:opacity-90 w-full"
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                        title="Load a new random puzzle"
                    >
                        Next Puzzle
                    </button>
                </div>
                
                <div className="order-1 md:order-2 relative">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded border border-gray-700 shadow-sm flex-shrink-0"
                            style={{
                                backgroundColor: direction === 'w' ? 'var(--white-piece-color)' : 'var(--black-piece-color)'
                            }}
                            title={`Next move: ${direction === 'w' ? 'White' : 'Black'}`}
                            aria-label={`Next move: ${direction === 'w' ? 'white' : 'black'}`}
                        />
                        <div className="text-neutral-400 text-center">
                            <span className="font-bold">#{puzzleIndex}</span>{' '}
                            <span className="text-sm px-2 py-1 rounded bg-gray-800 ml-2 capitalize">
                                {getCurrentDifficulty()}
                            </span>
                            {' '}
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
            </div>
            
            <div className="w-full max-w-[min(100vh,100vw)] mt-6">        
                <div 
                    className={`rounded-lg p-4 cursor-pointer transition-all duration-300`}
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
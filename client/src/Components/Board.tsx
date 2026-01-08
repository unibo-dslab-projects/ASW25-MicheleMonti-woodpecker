import { useEffect, useRef, useState } from "react";
import { BoardCell, DeskCell, BOARD_CELLS, COLUMNS, PieceType, ROWS, SideCell, WHITE_SIDE_CELLS, BLACK_SIDE_CELLS } from "../defs";
import { Difficulty, DIFFICULTY_RANGES } from "./constants";
import Piece from "./Piece";
import Square from "./Square";
import DifficultySelector from "./DifficultySelector";
import PuzzleDescription from "./PuzzleDescription";

const SIDE_CELLS_MAP = new Map<SideCell, PieceType>([
    ['w1', new PieceType('rook', 'white')], ['w2', new PieceType('king', 'white')], ['w3', new PieceType('knight', 'white')], ['w4', new PieceType('queen', 'white')], ['w5', new PieceType('bishop', 'white')], ['w6', new PieceType('pawn', 'white')],
    ['b1', new PieceType('bishop', 'black')], ['b2', new PieceType('pawn', 'black')], ['b3', new PieceType('knight', 'black')], ['b4', new PieceType('queen', 'black')], ['b5', new PieceType('rook', 'black')], ['b6', new PieceType('king', 'black')],
]);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
console.log('API Base URL:', API_BASE_URL);

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

async function getRandomBoardFromAPI(difficulty: Difficulty = 'easy'): Promise<{
    board: any,
    index: number,
    boardFromFen: Map<BoardCell, PieceType>,
    direction: string,
    description: string,
    solution: string
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/puzzles/random/${difficulty}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
        }
        
        const randomBoard = await response.json();
        
        let fen = randomBoard.fen;
        try {
            fen = decodeURIComponent(fen);
        } catch (e) {

        }
        
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

function getFallbackBoard(difficulty: Difficulty = 'easy') {
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

export default function Board() {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [puzzleData, setPuzzleData] = useState<{
        board: any,
        index: number,
        boardFromFen: Map<BoardCell, PieceType>,
        direction: string,
        description: string,
        solution: string
    } | null>(null);
    
    const [board, setBoard] = useState<Map<DeskCell, PieceType>>(new Map([...SIDE_CELLS_MAP]));
    const [selectedCell, setSelectedCell] = useState<DeskCell | null>(null);
    const [direction, setDirection] = useState<string>('w');
    const [description, setDescription] = useState<string>('');
    const [solution, setSolution] = useState<string>('');
    const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
    const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    
    const gridElement = useRef<HTMLDivElement>(null);

    function isSideCell(cell: DeskCell): boolean {
        return WHITE_SIDE_CELLS.includes(cell as typeof WHITE_SIDE_CELLS[number]) || BLACK_SIDE_CELLS.includes(cell as typeof BLACK_SIDE_CELLS[number]);
    }

    function onSelectedCell(cell: DeskCell) {
        if (selectedCell == cell) {
            setSelectedCell(null);
        } else if (selectedCell) {
            const piece = board.get(selectedCell);
            if (!piece) return;
            
            const destPiece = board.get(cell);
            const isDestSideCell = isSideCell(cell);
            const isSourceSideCell = isSideCell(selectedCell);
            
            const newBoard = new Map(board);
            
            newBoard.delete(selectedCell);
            
            if (!isDestSideCell) { newBoard.set(cell, piece); }
            if (isSourceSideCell) { newBoard.set(selectedCell, new PieceType(piece.type, piece.color)); }
            if ((isSourceSideCell && isDestSideCell) || (!isDestSideCell && destPiece && destPiece.color === piece.color)) {
                setSelectedCell(cell);
                return;
            }
            
            setBoard(newBoard);
            setSelectedCell(null);
        } else if (board.has(cell)) {
            setSelectedCell(cell);
        }
    }
    
    async function loadNewPuzzle() {
        setError(null);
        
        try {
            const newPuzzleData = await getRandomBoardFromAPI(difficulty);
            setPuzzleData(newPuzzleData);
            setDescription(newPuzzleData.description);
            
            setBoard(new Map([...newPuzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
            
            setDirection(newPuzzleData.direction);
            setSolution(newPuzzleData.solution);
            setSelectedCell(null);
            setIsSolutionRevealed(false);
            setPuzzleIndex(newPuzzleData.index);
        } catch (error) {
            setError('Failed to load puzzle. Please try again.');
            console.error('Error loading puzzle:', error);
        }
    }
    
    function restartPuzzle() {
        if (puzzleData) {
            setBoard(new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
            setSelectedCell(null);
            setIsSolutionRevealed(false);
        }
    }
    
    const getCurrentDifficulty = (): Difficulty => {
        if (puzzleIndex >= 1 && puzzleIndex <= 222) return 'easy';
        if (puzzleIndex >= 223 && puzzleIndex <= 984) return 'medium';
        return 'hard';
    };

    useEffect(() => {
        loadNewPuzzle();
    }, []);
    
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
            const observer = new MutationObserver(callback);
            observer.observe(
                gridElement.current, 
                {subtree: true, childList: true, attributes: false, characterData: false}
            );
            
            return () => observer.disconnect();
        }
    }, []);
    
    if (error && !puzzleData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black-background p-4">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button 
                    onClick={loadNewPuzzle}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black-background p-4">
            {/* Description */}
            <PuzzleDescription 
                puzzleIndex={puzzleIndex}
                difficulty={getCurrentDifficulty()}
                direction={direction}
                description={description}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full">
                {/* Controls panel */}
                <div 
                    className="order-2 md:order-1 rounded-lg p-4 mb-4 md:mb-0 flex flex-col gap-3 min-w-[200px]"
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                >
                    <DifficultySelector 
                        difficulty={difficulty}
                        setDifficulty={setDifficulty}
                    />
                    
                    <button 
                        onClick={restartPuzzle}
                        className="px-4 py-2 text-black rounded-lg transition-all whitespace-nowrap hover:opacity-90 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                        title="Reset current puzzle to starting position"
                    >
                        Restart Puzzle
                    </button>
                    
                    <button 
                        onClick={loadNewPuzzle}
                        className="px-4 py-2 text-black rounded-lg transition-all whitespace-nowrap hover:opacity-90 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                        title="Load a new random puzzle"
                    >
                        Next Puzzle
                    </button>
                </div>
                
                <div className="order-1 md:order-2 relative">
                    <div ref={gridElement} className="desk-grid-area w-[min(100vh,100vw)] p-3">
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
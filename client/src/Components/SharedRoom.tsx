import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DeskCell, BOARD_CELLS, COLUMNS, ROWS, WHITE_SIDE_CELLS, BLACK_SIDE_CELLS, PieceType } from "../defs";
import { getPuzzleByIdFromAPI } from "./utils/apiUtils";
import { SIDE_CELLS_MAP } from "./utils/boardUtils";
import Piece from "./Piece";
import Square from "./Square";
import LoadingOverlay from "./LoadingOverlay";
import { io, Socket } from "socket.io-client";
import PuzzleDescription from "./PuzzleDescription";
import { Difficulty } from "./constants";

export default function SharedRoom() {
    const { roomId } = useParams<{ roomId: string }>();
    const [searchParams] = useSearchParams();
    const puzzleId = parseInt(searchParams.get('puzzleId') || '1');
    const navigate = useNavigate();
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [board, setBoard] = useState<Map<DeskCell, PieceType>>(new Map([...SIDE_CELLS_MAP]));
    const [selectedCell, setSelectedCell] = useState<DeskCell | null>(null);
    const [description, setDescription] = useState<string>('');
    const [solution, setSolution] = useState<string>('');
    const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [direction, setDirection] = useState<string>('w');
    const [puzzleData, setPuzzleData] = useState<{
        boardFromFen: Map<DeskCell, PieceType>;
    } | null>(null);
    
    const gridElement = useRef<HTMLDivElement>(null);

    // Get difficulty from puzzle ID
    const getDifficulty = (): Difficulty => {
        if (puzzleId >= 1 && puzzleId <= 222) return 'easy';
        if (puzzleId >= 223 && puzzleId <= 984) return 'medium';
        return 'hard';
    };

    // Load puzzle data
    useEffect(() => {
        const loadPuzzle = async () => {
            try {
                const puzzleData = await getPuzzleByIdFromAPI(puzzleId);
                setDescription(puzzleData.description);
                const initialBoard = new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]);
                setBoard(initialBoard);
                setPuzzleData(puzzleData);
                setSolution(puzzleData.solution);
                setDirection(puzzleData.direction);
            } catch (error) {
                setError('Failed to load puzzle');
                console.error('Error loading puzzle:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadPuzzle();
    }, [puzzleId]);

    // Socket.IO connection
    useEffect(() => {
        if (!roomId || !puzzleId) return;
        
        // Connect to Socket.IO server
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket', 'polling']
        });
        
        setSocket(newSocket);
        
        // Socket event handlers
        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            newSocket.emit('join-room', roomId, puzzleId);
        });
        
        newSocket.on('room-joined', (data) => {
            console.log('Joined room:', data);
        });
        
        newSocket.on('piece-moved', (moveData) => {
            console.log('Received move:', moveData);
            applyRemoteMove(moveData);
        });
        
        newSocket.on('side-piece-moved', (moveData) => {
            console.log('Received side piece move:', moveData);
            applySidePieceMove(moveData);
        });
        
        newSocket.on('board-reset', () => {
            console.log('Received board reset signal');
            resetBoardForAllUsers();
        });
        
        newSocket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });
        
        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [roomId, puzzleId]);

    const applyRemoteMove = (moveData: any) => {
        console.log('Applying remote move:', moveData);
        
        const { from, to, piece, isSideCellMove } = moveData;
        
        setBoard(prevBoard => {
            const newBoard = new Map(prevBoard);
            
            if (isSideCellMove) {
                if (isSideCell(to as DeskCell)) {
                    newBoard.delete(from as DeskCell);
                } else {
                    newBoard.set(to as DeskCell, new PieceType(piece.type, piece.color));
                }
            } else {
                newBoard.delete(from as DeskCell);
                newBoard.set(to as DeskCell, new PieceType(piece.type, piece.color));
            }
            
            return newBoard;
        });
        
        setSelectedCell(null);
    };

    const applySidePieceMove = (moveData: any) => {
        const { from, to, piece } = moveData;
        
        setBoard(prevBoard => {
            const newBoard = new Map(prevBoard);
            newBoard.delete(from as DeskCell);
            newBoard.set(to as DeskCell, new PieceType(piece.type, piece.color));
            return newBoard;
        });
    };

    // Reset board for all users
    const resetBoardForAllUsers = () => {
        console.log('Resetting board...');
        if (puzzleData) {
            const newBoard = new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]);
            console.log('New board created with pieces:', newBoard.size);
            setBoard(newBoard);
            setSelectedCell(null);
        } else {
            console.error('No puzzle data available to reset');
        }
    };

    const isSideCell = (cell: DeskCell): boolean => {
        return WHITE_SIDE_CELLS.includes(cell as any) || BLACK_SIDE_CELLS.includes(cell as any);
    };

    const onSelectedCell = (cell: DeskCell) => {
        if (selectedCell == cell) {
            setSelectedCell(null);
        } else if (selectedCell) {
            const piece = board.get(selectedCell);
            if (!piece) return;
            
            const destPiece = board.get(cell);
            const isDestSideCell = isSideCell(cell);
            const isSourceSideCell = isSideCell(selectedCell);
            
            const newBoard = new Map(board);
            
            if (isSourceSideCell && isDestSideCell) {
                setSelectedCell(cell);
                return;
            }
            
            if (isSourceSideCell) {
                // Moving FROM side cell to board
                newBoard.set(cell, piece);
                setBoard(newBoard);
                setSelectedCell(null);
                
                // Send move to server
                if (socket && socket.connected) {
                    socket.emit('move-piece', roomId, {
                        from: selectedCell,
                        to: cell,
                        piece: {
                            type: piece.type,
                            color: piece.color
                        },
                        isSideCellMove: true,
                        moveType: 'from-side'
                    });
                }
            } else if (isDestSideCell) {
                // Moving FROM board TO side cell = capture
                newBoard.delete(selectedCell);
                setBoard(newBoard);
                setSelectedCell(null);
                
                // Send move to server
                if (socket && socket.connected) {
                    socket.emit('move-piece', roomId, {
                        from: selectedCell,
                        to: cell,
                        piece: {
                            type: piece.type,
                            color: piece.color
                        },
                        isSideCellMove: true,
                        moveType: 'to-side'
                    });
                }
            } else {
                // Regular board move
                newBoard.delete(selectedCell);
                newBoard.set(cell, piece);
                setBoard(newBoard);
                setSelectedCell(null);
                
                // Send move to server
                if (socket && socket.connected) {
                    socket.emit('move-piece', roomId, {
                        from: selectedCell,
                        to: cell,
                        piece: {
                            type: piece.type,
                            color: piece.color
                        },
                        isSideCellMove: false
                    });
                }
            }
        } else if (board.has(cell)) {
            setSelectedCell(cell);
        }
    };

    const handleShareRoom = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            alert('Room URL copied to clipboard!');
        }
    };

    const resetPuzzle = () => {
        console.log('Reset puzzle clicked');
        if (!puzzleData) {
            console.error('Cannot reset: no puzzle data');
            return;
        }
        
        // Reset locally first (optimistic update)
        resetBoardForAllUsers();
        
        // Then broadcast to all users in the room
        if (socket && socket.connected) {
            console.log('Emitting reset-board event to room:', roomId);
            socket.emit('reset-board', roomId);
        } else {
            console.error('Cannot reset: socket not connected');
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black-background p-4">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl"
                >
                    Back to Main
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-black-background p-4">
            {/* Back Button (styled like login page) */}
            <div className="w-full max-w-6xl">
                <button 
                    onClick={() => navigate('/')}
                    className="mb-6 text-neutral-300 hover:text-white font-medium transition-colors duration-200
                              flex items-center gap-2 hover:gap-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Puzzle
                </button>
            </div>

            {/* Top Bar */}
            <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex-1">
                    <PuzzleDescription 
                        puzzleIndex={puzzleId}
                        difficulty={getDifficulty()}
                        direction={direction}
                        description={description}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-6xl">
                {/* Left Control Panel */}
                <div 
                    className="order-2 md:order-1 rounded-2xl p-6 mb-4 md:mb-0 flex flex-col gap-4 min-w-[200px]
                               shadow-2xl border-2 border-white/10 relative"
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                >
                    {/* Connection Status with Dot */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-neutral-700">
                            {socket?.connected ? 'Connected' : 'Connecting...'}
                        </span>
                    </div>

                    {/* Reset Button */}
                    <button 
                        onClick={resetPuzzle}
                        className="px-6 py-3 text-black font-bold rounded-xl transition-all duration-200 
                                  shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 active:shadow-md
                                  border-b-4 border-gray-700 hover:border-gray-800 w-full
                                  hover:brightness-110 active:brightness-95 relative z-10"
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                        title="Reset puzzle to starting position for all users"
                    >
                        Reset Puzzle
                    </button>

                    {/* Share Room Button */}
                    <button 
                        onClick={handleShareRoom}
                        className="px-6 py-3 text-black font-bold rounded-xl transition-all duration-200 
                                  shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 active:shadow-md
                                  border-b-4 border-gray-700 hover:border-gray-800 w-full
                                  hover:brightness-110 active:brightness-95 relative z-10"
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                        title="Copy room URL to clipboard"
                    >
                        Share Room
                    </button>
                </div>
                
                {/* Board */}
                <div className="order-1 md:order-2 relative">
                    <div className={`relative transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
                        <div ref={gridElement} className="desk-grid-area w-[min(100vh,100vw)] p-3">
                            <div className="board-subgrid checkered-background rounded-lg shadow-2xl">
                                {BOARD_CELLS.map(cell => <Square key={cell} name={cell} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell}>
                                    <Piece piece={board.get(cell)} />
                                </Square>)}
                            </div>
                            <div className="white-side-subgrid bg-black-cell rounded-lg shadow-lg">
                                {WHITE_SIDE_CELLS.map(cell => <Square key={cell} name={cell} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell}>
                                    <Piece piece={board.get(cell)} />
                                </Square>)}
                            </div>
                            <div className="black-side-subgrid bg-white-cell rounded-lg shadow-lg">
                                {BLACK_SIDE_CELLS.map(cell => <Square key={cell} name={cell} onClick={() => onSelectedCell(cell)} isSelected={selectedCell == cell}>
                                    <Piece piece={board.get(cell)} />
                                </Square>)}
                            </div>
                            <div className="contents">
                                {COLUMNS.map(c => <div key={c} style={{ gridArea: `r${c}` }} className="text-neutral-400 place-self-center">{c.toLowerCase()}</div>)}
                                {ROWS.map(r => <div key={r} style={{ gridArea: `r${r}` }} className="text-neutral-400 place-self-center">{r}</div>)}
                            </div>
                        </div>
                        <LoadingOverlay isLoading={isLoading} message="Loading puzzle..." />
                    </div>
                </div>
            </div>
            
            {/* Solution Box */}
            <div className="w-full max-w-[min(100vh,100vw)] mt-6">        
                <div 
                    className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 
                               shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] active:shadow-lg
                               border-2 border-white/10 hover:border-white/20 active:border-white/30
                               ${isLoading ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                    onClick={() => !isLoading && setIsSolutionRevealed(!isSolutionRevealed)}
                >
                    <h3 className="font-bold text-2xl text-neutral-800 text-center mb-4">Solution</h3>
                    {isSolutionRevealed ? (
                        <div className="text-neutral-800 whitespace-pre-line p-4 bg-white/50 rounded-xl shadow-inner" dangerouslySetInnerHTML={{ __html: solution }} />
                    ) : (
                        <div className="text-neutral-600 text-center py-8 text-xl font-medium">Click to reveal the solution</div>
                    )}
                </div>
            </div>
        </div>
    );
}
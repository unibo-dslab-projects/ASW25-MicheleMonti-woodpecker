import { useEffect, useRef, useState } from "react";
import { DeskCell, BOARD_CELLS, COLUMNS, ROWS, WHITE_SIDE_CELLS, BLACK_SIDE_CELLS, PieceType } from "../defs";
import { Difficulty } from "./constants";
import Piece from "./Piece";
import Square from "./Square";
import DifficultySelector from "./DifficultySelector";
import PuzzleDescription from "./PuzzleDescription";
import LoadingOverlay from "./LoadingOverlay";
import ControlButton, { LoginButton } from "./ControlButton";
import { getRandomBoardFromAPI, getPuzzleByIdFromAPI, checkAuth, saveEvaluation, getEvaluation } from "./utils/apiUtils";
import { SIDE_CELLS_MAP } from "./utils/boardUtils";
import LoginPage from "./LoginPage";
import PuzzleEvaluation from "./PuzzleEvaluation";
import UserProfile from "./UserProfile";

export default function Board() {
    const [showLoginPage, setShowLoginPage] = useState<boolean>(false);
    const [showProfilePage, setShowProfilePage] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [puzzleData, setPuzzleData] = useState<{
        board: Map<DeskCell, PieceType>,
        index: number,
        boardFromFen: Map<DeskCell, PieceType>,
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
    const [isLoadingNewPuzzle, setIsLoadingNewPuzzle] = useState<boolean>(false);
    const [evaluation, setEvaluation] = useState<string | null>(null);
    const [pendingEvaluation, setPendingEvaluation] = useState<{
        puzzleId: number;
        evaluation: string;
    } | null>(null);
    
    const gridElement = useRef<HTMLDivElement>(null);

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuthentication = async () => {
            setIsCheckingAuth(true);
            try {
                const authStatus = await checkAuth();
                if (authStatus.authenticated) {
                    setIsLoggedIn(true);
                    setUsername(authStatus.username || '');
                    console.log('User authenticated:', authStatus.username);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuthentication();
    }, []);

    // Function to save pending evaluation to server
    const savePendingEvaluation = async () => {
        if (pendingEvaluation && isLoggedIn) {
            try {
                const result = await saveEvaluation(
                    pendingEvaluation.puzzleId, 
                    pendingEvaluation.evaluation
                );
                if (result.success) {
                    console.log(`Evaluation saved for puzzle ${pendingEvaluation.puzzleId}: ${pendingEvaluation.evaluation}`);
                } else {
                    console.error('Failed to save evaluation:', result.error);
                }
            } catch (error) {
                console.error('Error saving evaluation:', error);
            } finally {
                setPendingEvaluation(null);
            }
        }
    };

    // Function to load evaluation for current puzzle
    const loadCurrentEvaluation = async () => {
        if (isLoggedIn && puzzleIndex > 0) {
            try {
                const result = await getEvaluation(puzzleIndex);
                if (result.success) {
                    setEvaluation(result.evaluation || null);
                    console.log(`Loaded evaluation for puzzle ${puzzleIndex}: ${result.evaluation}`);
                }
            } catch (error) {
                console.error('Error loading evaluation:', error);
            }
        }
    };

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
            
            if (!isDestSideCell) newBoard.set(cell, piece);
            if (isSourceSideCell) newBoard.set(selectedCell, new PieceType(piece.type, piece.color));
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
        setIsLoadingNewPuzzle(true);
        
        try {
            // Save any pending evaluation before loading new puzzle
            await savePendingEvaluation();
            
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
        } finally {
            setIsLoadingNewPuzzle(false);
        }
    }

    async function loadSpecificPuzzle(puzzleId: number) {
        setError(null);
        setIsLoadingNewPuzzle(true);
        setShowProfilePage(false); // Close profile page
        
        try {
            // Save any pending evaluation before loading new puzzle
            await savePendingEvaluation();
            
            const newPuzzleData = await getPuzzleByIdFromAPI(puzzleId);
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
        } finally {
            setIsLoadingNewPuzzle(false);
        }
    }

    function restartPuzzle() {
        savePendingEvaluation().then(() => {
            if (puzzleData) {
                setBoard(new Map([...puzzleData.boardFromFen, ...SIDE_CELLS_MAP]));
                setSelectedCell(null);
                setIsSolutionRevealed(false);
            }
        });
    }
    
    const getCurrentDifficulty = (): Difficulty => {
        if (puzzleIndex >= 1 && puzzleIndex <= 222) return 'easy';
        if (puzzleIndex >= 223 && puzzleIndex <= 984) return 'medium';
        return 'hard';
    };

    useEffect(() => { loadNewPuzzle(); }, []);
    
    useEffect(() => {
        if (isLoggedIn && puzzleIndex > 0) {
            loadCurrentEvaluation();
        } else {
            setEvaluation(null);
        }
    }, [puzzleIndex, isLoggedIn]);
    
    // Animation observer for piece movements
    useEffect(() => {
        function callback(mutations: MutationRecord[]) {
            let from = null, to = null, piece = null;
            for (const m of mutations) {
                if (m.addedNodes.length) { to = m.target as Element; piece = m.addedNodes[0] as Element; } 
                else if (m.removedNodes.length) { from = m.target as Element; }
            }
            if (from && to && piece) {
                const rFrom = from.getBoundingClientRect(), rTo = to.getBoundingClientRect();
                const dx = rFrom.x - rTo.x, dy = rFrom.y - rTo.y;
                piece.animate([
                    { translate: `${dx}px ${dy}px` },
                    { translate: "0px 0px" },
                ], { duration: 200, easing: "cubic-bezier(0.65, 0, 0.35, 1)" })
            }
        }
        if (gridElement.current) {
            const observer = new MutationObserver(callback);
            observer.observe(gridElement.current, { subtree: true, childList: true });
            return () => observer.disconnect();
        }
    }, []);
    
    const handleLoginSuccess = (loggedInUsername: string) => {
        setIsLoggedIn(true);
        setUsername(loggedInUsername);
        setShowLoginPage(false);
    };
    
    const handleEvaluationChange = (newEvaluation: string | null) => {
        if (!isLoggedIn) {
            return;
        }
        
        const finalEvaluation = evaluation === newEvaluation ? null : newEvaluation;
        
        setEvaluation(finalEvaluation);
        
        if (finalEvaluation) {
            setPendingEvaluation({
                puzzleId: puzzleIndex,
                evaluation: finalEvaluation
            });
        } else {
            setPendingEvaluation(null);
        }
    };

    const handleLogoutComplete = () => {
        setIsLoggedIn(false);
        setUsername('');
        setEvaluation(null);
        setShowProfilePage(false);
    };
    
    if (showLoginPage) {
        return <LoginPage onBack={() => setShowLoginPage(false)} onLoginSuccess={handleLoginSuccess} />;
    }
    
    if (showProfilePage) {
        return <UserProfile 
            onBack={() => setShowProfilePage(false)} 
            onLogout={handleLogoutComplete}
            username={username}
            onPuzzleClick={loadSpecificPuzzle}
        />;
    }
    
    if (error && !puzzleData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black-background p-4">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button 
                    onClick={loadNewPuzzle}
                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl transition-all duration-200 
                              shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 active:shadow-md
                              border-b-4 border-blue-700 hover:border-blue-800"
                >
                    Try Again
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center min-h-screen bg-black-background p-4">
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex-1">
                    <PuzzleDescription 
                        puzzleIndex={puzzleIndex}
                        difficulty={getCurrentDifficulty()}
                        direction={direction}
                        description={description}
                    />
                </div>
                <div className="md:ml-4 flex-shrink-0">
                    {isCheckingAuth ? (
                        <div className="text-neutral-400 text-sm animate-pulse">
                            Checking auth...
                        </div>
                    ) : isLoggedIn ? (
                        <button 
                            onClick={() => setShowProfilePage(true)}
                            className="px-6 py-3 text-black font-bold rounded-xl transition-all duration-200 
                                      shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 active:shadow-md
                                      border-b-4 border-gray-700 hover:border-gray-800
                                      hover:brightness-110 active:brightness-95 relative z-10"
                            style={{ backgroundColor: 'var(--black-cell-color)' }}
                            title="View your profile"
                        >
                            {username}
                        </button>
                    ) : (
                        <LoginButton 
                            onClick={() => setShowLoginPage(true)}
                            title="Login to save your progress"
                        />
                    )}
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full">
                <div 
                    className="order-2 md:order-1 rounded-2xl p-6 mb-4 md:mb-0 flex flex-col gap-4 min-w-[200px]
                               shadow-2xl border-2 border-white/10 relative"
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                >
                    <div className="relative">
                        <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} />
                    </div>
                    <PuzzleEvaluation 
                        isLoggedIn={isLoggedIn}
                        selectedEvaluation={evaluation}
                        onEvaluationChange={handleEvaluationChange}
                    />
                    <ControlButton onClick={restartPuzzle} title="Reset current puzzle to starting position">Restart Puzzle</ControlButton>
                    <ControlButton onClick={loadNewPuzzle} title="Load a new random puzzle">Next Puzzle</ControlButton>
                </div>
                
                <div className="order-1 md:order-2 relative">
                    <div className={`relative transition-opacity duration-300 ${isLoadingNewPuzzle ? 'opacity-70' : 'opacity-100'}`}>
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
                        <LoadingOverlay isLoading={isLoadingNewPuzzle} />
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-[min(100vh,100vw)] mt-6">        
                <div 
                    className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 
                               shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] active:shadow-lg
                               border-2 border-white/10 hover:border-white/20 active:border-white/30
                               ${isLoadingNewPuzzle ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                    onClick={() => !isLoadingNewPuzzle && setIsSolutionRevealed(!isSolutionRevealed)}
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
// utils/apiUtils.ts
import { Difficulty } from "../constants";
import { fenToBoardMap, getFallbackBoard } from "./boardUtils";
import { BoardCell, PieceType } from "../../defs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
console.log('API Base URL:', API_BASE_URL);

// Token management
const TOKEN_KEY = 'woodpecker_auth_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeader(): { Authorization: string } | {} {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(username: string, password: string): Promise<{ 
    success: boolean; 
    username?: string; 
    token?: string;
    error?: string 
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.error || `Registration failed (${response.status})` 
            };
        }

        // Store the token
        if (data.token) {
            setToken(data.token);
        }

        return { 
            success: true, 
            username: data.user?.username || username,
            token: data.token
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { 
            success: false, 
            error: 'Network error. Please check your connection.' 
        };
    }
}

// Authentication functions
export async function loginUser(username: string, password: string): Promise<{ 
    success: boolean; 
    username?: string; 
    token?: string;
    error?: string 
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.error || `Login failed (${response.status})` 
            };
        }

        // Store the token
        if (data.token) {
            setToken(data.token);
        }

        return { 
            success: true, 
            username: data.user?.username || username,
            token: data.token
        };
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: 'Network error. Please check your connection.' 
        };
    }
}

export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
        // Remove token from localStorage
        removeToken();
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { 
            success: false, 
            error: 'Logout failed' 
        };
    }
}

export async function checkAuth(): Promise<{ 
    authenticated: boolean; 
    username?: string;
    user?: any;
    error?: string 
}> {
    try {
        const token = getToken();
        
        if (!token) {
            return { authenticated: false };
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // If 401 or 403, token is invalid
            if (response.status === 401 || response.status === 403) {
                removeToken();
                return { authenticated: false };
            }
            return { authenticated: false };
        }

        const data = await response.json();
        return { 
            authenticated: true, 
            username: data.user?.username,
            user: data.user
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return { authenticated: false };
    }
}

// Existing puzzle function (keep as is)
export async function getRandomBoardFromAPI(difficulty: Difficulty = 'easy'): Promise<{
    board: any,
    index: number,
    boardFromFen: Map<BoardCell, PieceType>,
    direction: string,
    description: string,
    solution: string
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/puzzles/random/${difficulty}`);
        if (!response.ok) throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
        
        const randomBoard = await response.json();
        let fen = randomBoard.fen;
        try { fen = decodeURIComponent(fen); } catch (e) {}
        
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

// Optional: Add a function to save user progress (if you implement this later)
export async function savePuzzleProgress(
    puzzleId: number, 
    isSolved: boolean, 
    timeSpent?: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const token = getToken();
        
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }

        // This would require a new endpoint on your server
        // For now, just log it
        console.log('Puzzle progress (would save to server):', { 
            puzzleId, 
            isSolved, 
            timeSpent 
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving progress:', error);
        return { success: false, error: 'Failed to save progress' };
    }
}
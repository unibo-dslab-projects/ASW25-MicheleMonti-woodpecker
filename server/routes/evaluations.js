const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getUserEvaluations, getPuzzleDetails, formatEvaluationResponse } = require('../utils/evaluations');
const Vote = require('../models/Vote');
const router = express.Router();

// Get user's evaluation for a specific puzzle
router.get('/:puzzleId', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        const puzzleId = req.params.puzzleId;
        
        const userEvaluations = await getUserEvaluations(username);
        
        if (userEvaluations.length === 0) {
            return res.json({ evaluation: null });
        }
        
        const existingEvaluation = userEvaluations.find(e => e.puzzle_id === puzzleId);
        
        if (!existingEvaluation) {
            return res.json({ evaluation: null });
        }
        
        res.json({ evaluation: existingEvaluation.evaluation });
        
    } catch (error) {
        console.error('Error getting evaluation:', error);
        res.status(500).json({ error: 'Failed to get evaluation' });
    }
});

// Get ALL user evaluations for statistics
router.get('/user/all', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        
        const userEvaluations = await getUserEvaluations(username);
        
        res.json({ 
            evaluations: userEvaluations.map(e => formatEvaluationResponse(e, false))
        });
        
    } catch (error) {
        console.error('Error getting user evaluations:', error);
        res.status(500).json({ error: 'Failed to get user evaluations' });
    }
});

// Get user's recent evaluations
router.get('/user/recent', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        const limit = parseInt(req.query.limit) || 3;
        
        const userEvaluations = await getUserEvaluations(username);
        
        if (userEvaluations.length === 0) {
            return res.json({ evaluations: [] });
        }
        
        const recentEvaluations = userEvaluations.slice(-limit).reverse();
        
        // Get puzzle details for each evaluation
        const evaluationsWithDetails = await Promise.all(
            recentEvaluations.map(async (evalItem) => {
                const puzzleDetails = await getPuzzleDetails(evalItem.puzzle_id);
                return {
                    ...formatEvaluationResponse(evalItem, true),
                    puzzle: puzzleDetails
                };
            })
        );
        
        res.json({ 
            evaluations: evaluationsWithDetails
        });
        
    } catch (error) {
        console.error('Error getting recent evaluations:', error);
        res.status(500).json({ error: 'Failed to get recent evaluations' });
    }
});

// Get user statistics directly
router.get('/user/stats', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        const userEvaluations = await getUserEvaluations(username);
        
        const total = userEvaluations.length;
        const solvedCount = userEvaluations.filter(e => e.evaluation === 'solved').length;
        const partialCount = userEvaluations.filter(e => e.evaluation === 'partial').length;
        const failedCount = userEvaluations.filter(e => e.evaluation === 'failed').length;
        const successRate = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
        
        // Calculate difficulty breakdown
        const easyCount = userEvaluations.filter(e => {
            const id = parseInt(e.puzzle_id);
            return id >= 1 && id <= 222;
        }).length;
        
        const mediumCount = userEvaluations.filter(e => {
            const id = parseInt(e.puzzle_id);
            return id >= 223 && id <= 984;
        }).length;
        
        const hardCount = userEvaluations.filter(e => {
            const id = parseInt(e.puzzle_id);
            return id >= 985 && id <= 1128;
        }).length;
        
        res.json({
            stats: {
                totalPuzzles: total,
                solvedCount,
                partialCount,
                failedCount,
                successRate,
                difficultyBreakdown: {
                    easy: easyCount,
                    medium: mediumCount,
                    hard: hardCount
                }
            }
        });
        
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ error: 'Failed to get user stats' });
    }
});

// Save or update user's evaluation for a puzzle
router.post('/save', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        const { puzzleId, evaluation } = req.body;
        
        if (!puzzleId || !evaluation) {
            return res.status(400).json({ error: 'Puzzle ID and evaluation are required' });
        }
        
        const validEvaluations = ['failed', 'partial', 'solved'];
        if (!validEvaluations.includes(evaluation)) {
            return res.status(400).json({ error: 'Invalid evaluation value' });
        }
        
        let votesDoc = await Vote.findOne({});
        if (!votesDoc) {
            votesDoc = new Vote({
                evaluations: new Map()
            });
        }
        
        let userEvaluations = votesDoc.evaluations.get(username) || [];
        
        const existingIndex = userEvaluations.findIndex(e => e.puzzle_id === puzzleId.toString());
        
        if (existingIndex >= 0) {
            // Update existing evaluation
            userEvaluations[existingIndex] = {
                puzzle_id: puzzleId.toString(),
                evaluation: evaluation
            };
        } else {
            // Add new evaluation
            userEvaluations.push({
                puzzle_id: puzzleId.toString(),
                evaluation: evaluation
            });
        }
        
        votesDoc.evaluations.set(username, userEvaluations);
        await votesDoc.save();
        
        res.json({ 
            success: true, 
            message: 'Evaluation saved'
        });
        
    } catch (error) {
        console.error('Error saving evaluation:', error);
        res.status(500).json({ error: 'Failed to save evaluation' });
    }
});

module.exports = router;
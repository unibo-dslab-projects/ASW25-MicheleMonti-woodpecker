const express = require('express');
const Puzzle = require('../models/Puzzle');
const { extractPuzzlesFromDocument } = require('../utils/puzzles');
const router = express.Router();

// Get all puzzles
router.get('/', async (req, res) => {
    try {
        const doc = await Puzzle.findOne();
        if (!doc) {
            return res.status(404).json({ error: 'Puzzle data not found' });
        }
        
        const puzzles = extractPuzzlesFromDocument(doc);
        res.json(puzzles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get puzzle by ID
router.get('/:id', async (req, res) => {
    try {
        const puzzleId = parseInt(req.params.id);
        if (isNaN(puzzleId) || puzzleId < 1 || puzzleId > 1128) {
            return res.status(400).json({ error: 'Invalid puzzle ID' });
        }
        
        const doc = await Puzzle.findOne();
        if (!doc) {
            return res.status(404).json({ error: 'Puzzle data not found' });
        }
        
        const puzzle = doc[puzzleId.toString()];
        if (!puzzle) {
            return res.status(404).json({ error: 'Puzzle not found' });
        }
        
        res.json({
            puzzle_id: puzzleId,
            descr: puzzle.descr,
            direction: puzzle.direction,
            fen: puzzle.fen,
            solution: puzzle.solution || 'No solution available',
            unicode: puzzle.unicode,
            lichess: puzzle.lichess
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get random puzzle by difficulty
router.get('/random/:difficulty', async (req, res) => {
    try {
        const { difficulty } = req.params;
        
        const ranges = {
            easy: { min: 1, max: 222 },
            medium: { min: 223, max: 984 },
            hard: { min: 985, max: 1128 }
        };
        
        const range = ranges[difficulty];
        if (!range) {
            return res.status(400).json({ error: 'Invalid difficulty level' });
        }
        
        const doc = await Puzzle.findOne();
        if (!doc) {
            return res.status(404).json({ error: 'Puzzle data not found' });
        }
        
        const puzzlesInRange = [];
        
        for (let i = range.min; i <= range.max; i++) {
            const puzzleKey = i.toString();
            const puzzle = doc[puzzleKey];
            if (puzzle) {
                puzzlesInRange.push({
                    puzzle_id: i,
                    ...puzzle
                });
            }
        }
        
        if (puzzlesInRange.length === 0) {
            return res.status(404).json({ error: `No ${difficulty} puzzles found` });
        }
        
        const randomIndex = Math.floor(Math.random() * puzzlesInRange.length);
        const randomPuzzle = puzzlesInRange[randomIndex];
        
        const response = {
            puzzle_id: randomPuzzle.puzzle_id,
            descr: randomPuzzle.descr,
            direction: randomPuzzle.direction,
            fen: randomPuzzle.fen,
            solution: randomPuzzle.solution || 'No solution available',
            unicode: randomPuzzle.unicode,
            lichess: randomPuzzle.lichess
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get puzzles by range
router.get('/range/:min/:max', async (req, res) => {
    try {
        const min = parseInt(req.params.min);
        const max = parseInt(req.params.max);
        
        if (isNaN(min) || isNaN(max) || min < 1 || max > 1128 || min > max) {
            return res.status(400).json({ error: 'Invalid range' });
        }
        
        const doc = await Puzzle.findOne();
        if (!doc) {
            return res.status(404).json({ error: 'Puzzle data not found' });
        }
        
        const puzzles = [];
        for (let i = min; i <= max; i++) {
            const puzzleKey = i.toString();
            const puzzle = doc[puzzleKey];
            if (puzzle) {
                puzzles.push({
                    puzzle_id: i,
                    descr: puzzle.descr,
                    direction: puzzle.direction,
                    fen: puzzle.fen,
                    solution: puzzle.solution || 'No solution available',
                    unicode: puzzle.unicode,
                    lichess: puzzle.lichess
                });
            }
        }
        
        res.json(puzzles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
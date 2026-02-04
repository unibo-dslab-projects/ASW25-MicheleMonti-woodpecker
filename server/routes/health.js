const express = require('express');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const usersDoc = await User.findOne({});
        const puzzleCount = await Puzzle.countDocuments();
        
        res.json({
            status: 'OK',
            database: 'woodpecker_boards',
            collections: {
                users: { 
                    count: usersDoc ? usersDoc.users.length : 0,
                    structure: 'Array within single document'
                },
                puzzles: { count: puzzleCount }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
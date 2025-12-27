const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://MontiMic:RavuNL0YhiNxHuQx@cluster0.guvyxky.mongodb.net/woodpecker_boards?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Puzzle Schema - using strict: false to accept dynamic keys
const puzzleSchema = new mongoose.Schema({}, { strict: false, collection: 'puzzles' });
const Puzzle = mongoose.model('Puzzle', puzzleSchema);

// Helper function to extract puzzles from the single document
function extractPuzzlesFromDocument(doc) {
  const puzzles = [];
  
  // Loop through all keys except _id
  for (const key in doc) {
    if (key !== '_id' && key !== '__v') {
      const puzzleData = doc[key];
      if (puzzleData && typeof puzzleData === 'object') {
        puzzles.push({
          puzzle_id: parseInt(key),
          descr: puzzleData.descr,
          direction: puzzleData.direction,
          fen: puzzleData.fen,
          solution: puzzleData.solution || 'No solution available',
          unicode: puzzleData.unicode,
          lichess: puzzleData.lichess
        });
      }
    }
  }
  
  return puzzles.sort((a, b) => a.puzzle_id - b.puzzle_id);
}

// API Routes
app.get('/api/puzzles', async (req, res) => {
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

app.get('/api/puzzles/:id', async (req, res) => {
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

app.get('/api/puzzles/random/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    console.log(`[API] Fetching ${difficulty} puzzle`);
    
    const ranges = {
      easy: { min: 1, max: 222 },
      medium: { min: 223, max: 984 },
      hard: { min: 985, max: 1128 }
    };
    
    const range = ranges[difficulty];
    if (!range) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }
    
    // Get the single document
    const doc = await Puzzle.findOne();
    if (!doc) {
      return res.status(404).json({ error: 'Puzzle data not found' });
    }
    
    // Collect puzzles in the difficulty range
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
    
    console.log(`[API] Found ${puzzlesInRange.length} puzzles in ${difficulty} range`);
    
    if (puzzlesInRange.length === 0) {
      return res.status(404).json({ error: `No ${difficulty} puzzles found` });
    }
    
    // Pick random puzzle
    const randomIndex = Math.floor(Math.random() * puzzlesInRange.length);
    const randomPuzzle = puzzlesInRange[randomIndex];
    
    console.log(`[API] Returning puzzle ID: ${randomPuzzle.puzzle_id}`);
    
    // Ensure solution field exists
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
    console.error('[API] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/puzzles/range/:min/:max', async (req, res) => {
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
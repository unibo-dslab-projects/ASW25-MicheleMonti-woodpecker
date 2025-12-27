const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define schemas
const puzzleSchema = new mongoose.Schema({
  puzzle_id: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  fen: { type: String, required: true },
  direction: { type: String, enum: ['w', 'b'], required: true },
  solution: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
});

const Puzzle = mongoose.model('Puzzle', puzzleSchema);

async function migratePuzzles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://MontiMic:RavuNL0YhiNxHuQx@cluster0.guvyxky.mongodb.net/?appName=Cluster0");
    
    // Read the JSON file
    const data = fs.readFileSync(path.join(__dirname, 'woodpecker_boards.json'), 'utf8');
    const woodpeckerBoards = JSON.parse(data);
    
    const puzzlesToInsert = [];
    
    // Transform JSON data
    for (const [key, puzzleData] of Object.entries(woodpeckerBoards)) {
      const puzzleId = parseInt(key);
      
      // Determine difficulty based on ID range
      let difficulty = 'easy';
      if (puzzleId >= 223 && puzzleId <= 984) difficulty = 'medium';
      if (puzzleId >= 985 && puzzleId <= 1128) difficulty = 'hard';
      
      // Decode FEN (remove URL encoding if present)
      let fen = puzzleData.fen;
      try {
        fen = decodeURIComponent(fen);
      } catch (e) {
        // Keep original if not encoded
      }
      
      puzzlesToInsert.push({
        puzzle_id: puzzleId,
        description: puzzleData.descr,
        fen: fen,
        direction: puzzleData.direction,
        solution: puzzleData.solution || 'No solution available',
        difficulty: difficulty,
      });
    }
    
    // Insert all puzzles
    await Puzzle.insertMany(puzzlesToInsert, { ordered: false });
    
    console.log(`Successfully migrated ${puzzlesToInsert.length} puzzles`);
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePuzzles();
require('dotenv').config();
const mongoose = require('mongoose');

async function testFixed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    const Puzzle = mongoose.model('Puzzle', new mongoose.Schema({}, { strict: false }), 'puzzles');
    const doc = await Puzzle.findOne();
    
    console.log('\n🧩 Testing puzzle extraction:');
    
    // Test puzzle #1
    const puzzle1 = doc['1'];
    console.log('Puzzle 1:', {
      exists: !!puzzle1,
      descr: puzzle1?.descr?.substring(0, 50) + '...',
      direction: puzzle1?.direction,
      fen: puzzle1?.fen?.substring(0, 30) + '...'
    });
    
    // Count total puzzles
    let count = 0;
    for (const key in doc) {
      if (key !== '_id' && key !== '__v' && !isNaN(key)) {
        count++;
      }
    }
    console.log(`\n📊 Total puzzles found: ${count}`);
    
    // Test random extraction
    const ranges = { easy: { min: 1, max: 222 } };
    const easyPuzzles = [];
    for (let i = 1; i <= 222; i++) {
      if (doc[i.toString()]) {
        easyPuzzles.push(i);
      }
    }
    console.log(`🎲 Easy puzzles available: ${easyPuzzles.length}`);
    
    if (easyPuzzles.length > 0) {
      const randomId = easyPuzzles[Math.floor(Math.random() * easyPuzzles.length)];
      const randomPuzzle = doc[randomId.toString()];
      console.log(`\nRandom easy puzzle (ID: ${randomId}):`);
      console.log('Description:', randomPuzzle.descr);
      console.log('FEN:', randomPuzzle.fen);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFixed();
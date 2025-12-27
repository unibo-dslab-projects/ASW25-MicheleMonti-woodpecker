const mongoose = require('mongoose');
require('dotenv').config();

async function checkStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const db = mongoose.connection.db;
    const puzzlesCollection = db.collection('puzzles');
    
    // Get the first (and only) document
    const doc = await puzzlesCollection.findOne({});
    
    console.log('\n📄 Document structure:');
    console.log('Type:', typeof doc);
    console.log('Is Array?', Array.isArray(doc));
    
    if (doc) {
      console.log('\n🔍 Document keys:');
      Object.keys(doc).forEach(key => {
        const value = doc[key];
        console.log(`  ${key}:`, 
          Array.isArray(value) ? `Array[${value.length}]` : 
          typeof value === 'object' ? `Object with ${Object.keys(value || {}).length} keys` : 
          typeof value);
      });
      
      // Check if it has an array of puzzles
      if (doc.puzzles && Array.isArray(doc.puzzles)) {
        console.log(`\n🎲 Found puzzles array with ${doc.puzzles.length} items`);
        console.log('First puzzle:', JSON.stringify(doc.puzzles[0], null, 2).substring(0, 200) + '...');
      }
      
      // Check if document itself is an array of puzzles
      if (Array.isArray(doc)) {
        console.log(`\n🎲 Document is an array with ${doc.length} puzzles`);
        console.log('First item:', JSON.stringify(doc[0], null, 2).substring(0, 200) + '...');
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStructure();
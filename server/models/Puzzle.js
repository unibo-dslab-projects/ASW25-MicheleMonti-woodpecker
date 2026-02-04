const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'puzzles'
});

module.exports = mongoose.model('Puzzle', puzzleSchema);
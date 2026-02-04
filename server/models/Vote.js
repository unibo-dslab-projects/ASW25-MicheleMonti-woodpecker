const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    puzzle_id: {
        type: String,
        required: true
    },
    evaluation: {
        type: String,
        enum: ['failed', 'partial', 'solved'],
        required: true
    }
}, { _id: false });

const votesSchema = new mongoose.Schema({
    evaluations: {
        type: Map,
        of: [evaluationSchema]
    }
}, { 
    collection: 'votes',
    versionKey: false 
});

module.exports = mongoose.model('Votes', votesSchema);
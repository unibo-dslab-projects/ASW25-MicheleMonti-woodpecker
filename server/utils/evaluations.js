const Vote = require('../models/Vote');
const Puzzle = require('../models/Puzzle');

async function getUserEvaluations(username) {
    const votesDoc = await Vote.findOne({});
    
    if (!votesDoc || !votesDoc.evaluations) {
        return [];
    }
    
    const userEvaluations = votesDoc.evaluations.get(username);
    return userEvaluations || [];
}

async function getPuzzleDetails(puzzleId) {
    const doc = await Puzzle.findOne();
    if (!doc || !doc[puzzleId]) {
        return null;
    }
    
    const puzzle = doc[puzzleId];
    return {
        descr: puzzle.descr,
        fen: puzzle.fen,
        direction: puzzle.direction,
        solution: puzzle.solution || 'No solution available'
    };
}

function formatEvaluationResponse(evalItem, includePuzzleDetails = false) {
    const baseResponse = {
        puzzleId: evalItem.puzzle_id,
        evaluation: evalItem.evaluation
    };
    
    return includePuzzleDetails 
        ? { ...baseResponse, puzzle: null }
        : baseResponse;
}

module.exports = {
    getUserEvaluations,
    getPuzzleDetails,
    formatEvaluationResponse
};
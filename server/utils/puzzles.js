function extractPuzzlesFromDocument(doc) {
    const puzzles = [];
    
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

module.exports = {
    extractPuzzlesFromDocument
};
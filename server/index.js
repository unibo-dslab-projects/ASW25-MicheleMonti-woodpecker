require('dotenv').config();

const connectDB = require('./config/database');
const app = require('./app');
const setupServer = require('./server');

const PORT = process.env.PORT || 3001;

connectDB();

const server = setupServer(app);

server.listen(PORT, () => {
    console.log(`\n=== Woodpecker Chess Server ===`);
    console.log(`HTTP Server running on port ${PORT}`);
    console.log(`Socket.IO Server ready for connections`);
    console.log(`Database: woodpecker_boards`);
    console.log(`\nAvailable Endpoints:`);
    console.log(`  Health Check:     GET  http://localhost:${PORT}/api/health`);
    console.log(`  Register:         POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  Login:            POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  Get User:         GET  http://localhost:${PORT}/api/auth/me (requires token)`);
    console.log(`  Get Evaluation:   GET  http://localhost:${PORT}/api/evaluations/:puzzleId (requires token)`);
    console.log(`  Get User Stats:   GET  http://localhost:${PORT}/api/evaluations/user/stats (requires token)`);
    console.log(`  Get Recent Evals: GET  http://localhost:${PORT}/api/evaluations/user/recent (requires token)`);
    console.log(`  Get All Evals:    GET  http://localhost:${PORT}/api/evaluations/user/all (requires token)`);
    console.log(`  Save Evaluation:  POST http://localhost:${PORT}/api/evaluations/save (requires token)`);
    console.log(`  All Puzzles:      GET  http://localhost:${PORT}/api/puzzles`);
    console.log(`  Puzzle by ID:     GET  http://localhost:${PORT}/api/puzzles/:id`);
    console.log(`  Random Puzzle:    GET  http://localhost:${PORT}/api/puzzles/random/:difficulty`);
    console.log(`  Puzzle Range:     GET  http://localhost:${PORT}/api/puzzles/range/:min/:max`);
    console.log(`\nSocket.IO Events:`);
    console.log(`  Connect to:       ws://localhost:${PORT}`);
    console.log(`  Join room:        emit 'join-room', roomId, puzzleId`);
    console.log(`  Move piece:       emit 'move-piece', roomId, moveData`);
    console.log(`  Leave room:       emit 'leave-room', roomId`);
});
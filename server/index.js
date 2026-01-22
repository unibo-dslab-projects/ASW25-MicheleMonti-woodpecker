const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas (woodpecker_boards database)'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSubSchema = new mongoose.Schema({
    username: String,
    password_hash: String
}, { _id: false });

const usersCollectionSchema = new mongoose.Schema({
    users: [userSubSchema]
}, { 
    collection: 'users',
    versionKey: false
});

const UsersCollection = mongoose.model('UsersCollection', usersCollectionSchema);

const puzzleSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'puzzles'
});

const Puzzle = mongoose.model('Puzzle', puzzleSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

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

// Registration route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log(`[Registration] Attempting to register user: ${username}`);
        console.log(`[Registration] Request body:`, { username: username, password: '[HIDDEN]' });

        if (!username || !password) {
            console.log('[Registration] Validation failed: missing fields');
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (password.length < 6) {
            console.log('[Registration] Validation failed: password too short');
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        console.log('[Registration] Checking for existing users collection...');
        let usersDoc = await UsersCollection.findOne({});
        
        console.log(`[Registration] Current usersDoc:`, usersDoc);
        
        if (!usersDoc) {
            console.log('[Registration] No existing users document, creating new one');
            usersDoc = new UsersCollection({
                users: []
            });
            await usersDoc.save();
            console.log('[Registration] Created empty users document');
        }

        const existingUser = usersDoc.users.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase().trim()
        );
        
        if (existingUser) {
            console.log(`[Registration] Username "${username}" already exists`);
            return res.status(409).json({ error: 'Username already exists' });
        }

        console.log(`[Registration] Username "${username}" is available`);

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        console.log('[Registration] Password hashed successfully');

        const newUser = {
            username: username.trim(),
            password_hash: passwordHash
        };

        console.log('[Registration] New user object:', { 
            username: newUser.username, 
            password_hash_length: newUser.password_hash.length 
        });

        usersDoc.users.push(newUser);
        console.log(`[Registration] Added user to array. Total users now: ${usersDoc.users.length}`);

        console.log('[Registration] Attempting to save to database...');
        const savedDoc = await usersDoc.save();
        console.log('[Registration] Save successful, document ID:', savedDoc._id);

        const token = jwt.sign(
            { 
                userId: username,
                username: username 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`[Registration] JWT token generated for user: ${username}`);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: username,
                username: username
            }
        });

        console.log(`[Registration] Registration completed successfully for user: ${username}`);

    } catch (error) {
        console.error('[Registration] ERROR DETAILS:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.code) {
            console.error('Error code:', error.code);
        }
        
        if (error.name === 'MongoError') {
            console.error('MongoDB Error details:', error);
        }
        
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        console.log(`Login attempt for user: ${username}`);
        
        const usersDoc = await UsersCollection.findOne({});
        
        if (!usersDoc || !usersDoc.users || usersDoc.users.length === 0) {
            console.log('No users found in database');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`Found ${usersDoc.users.length} users in array`);
        
        const user = usersDoc.users.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase().trim()
        );
        
        if (!user) {
            console.log(`User "${username}" not found in users array`);
            console.log('Available users:', usersDoc.users.map(u => u.username));
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`User found: ${user.username}`);
        console.log(`Password hash: ${user.password_hash?.substring(0, 30)}...`);
        
        if (!user.password_hash) {
            console.log('No password hash found for user');
            return res.status(500).json({ error: 'User data error' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            console.log(`Invalid password for user: ${user.username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`Password valid for: ${user.username}`);
        
        const token = jwt.sign(
            { 
                userId: user.username,
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.username,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user info (protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        
        const usersDoc = await UsersCollection.findOne({});
        
        if (!usersDoc || !usersDoc.users) {
            return res.status(404).json({ error: 'Users not found' });
        }
        
        const user = usersDoc.users.find(u => u.username === username);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.username,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const usersDoc = await UsersCollection.findOne({});
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
        
        const doc = await Puzzle.findOne();
        if (!doc) {
            return res.status(404).json({ error: 'Puzzle data not found' });
        }
        
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
        
        const randomIndex = Math.floor(Math.random() * puzzlesInRange.length);
        const randomPuzzle = puzzlesInRange[randomIndex];
        
        console.log(`[API] Returning puzzle ID: ${randomPuzzle.puzzle_id}`);
        
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

app.listen(PORT, () => {
    console.log(`\n=== Woodpecker Chess Server ===`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: woodpecker_boards`);
    console.log(`Users structure: Array within single document`);
    console.log(`\nAvailable Endpoints:`);
    console.log(`  Health Check:  GET  http://localhost:${PORT}/api/health`);
    console.log(`  Debug Users:   GET  http://localhost:${PORT}/api/auth/debug-users`);
    console.log(`  Register:      POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  Login:         POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  Get User:      GET  http://localhost:${PORT}/api/auth/me (requires token)`);
    console.log(`  Random Puzzle: GET  http://localhost:${PORT}/api/puzzles/random/:difficulty`);
});
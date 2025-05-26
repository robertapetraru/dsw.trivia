const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();

// Enable detailed logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Serve admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin.html'));
});

// API routes
app.get('/api/questions', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'intrebari.json');
        console.log('Reading questions from:', filePath);
        
        // Check if file exists
        await fs.access(filePath);
        
        const data = await fs.readFile(filePath, 'utf8');
        const questions = JSON.parse(data);
        res.json(questions);
    } catch (error) {
        console.error('Error reading questions:', error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Questions file not found' });
        } else {
            res.status(500).json({ error: 'Failed to read questions' });
        }
    }
});

app.post('/api/questions', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'intrebari.json');
        let questions = [];

        // Create data directory if it doesn't exist
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Read existing questions if file exists
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            if (fileContent) {
                questions = JSON.parse(fileContent);
                if (!Array.isArray(questions)) {
                    questions = [];
                }
            }
        } catch (err) {
            // File doesn't exist or is empty, use empty array
            console.log('Creating new questions array');
        }

        // Log for debugging
        console.log('Current questions:', questions);
        console.log('New question:', req.body);

        // Add new question
        questions.push(req.body);

        // Save to file
        await fs.writeFile(filePath, JSON.stringify(questions, null, 2));
        console.log('Questions saved successfully');

        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.toString() });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving index.html from: ${path.join(__dirname, 'public', 'html', 'index.html')}`);
}).on('error', (error) => {
    console.error('Server failed to start:', error);
});
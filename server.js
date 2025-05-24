const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Create the directories if they don't exist
const dirs = ['public', 'public/html', 'public/css', 'public/js', 'data'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Initialize questions.json if it doesn't exist
const questionsPath = path.join(__dirname, 'data', 'questions.json');
if (!fs.existsSync(questionsPath)) {
    const initialQuestions = [
        {
            id: 1,
            question: "What is the capital of France?",
            correctAnswer: "Paris",
            incorrectAnswers: ["London", "Berlin", "Madrid"],
            difficulty: 1
        },
        {
            id: 2,
            question: "Which planet is known as the Red Planet?",
            correctAnswer: "Mars",
            incorrectAnswers: ["Jupiter", "Venus", "Saturn"],
            difficulty: 1
        },
        {
            id: 3,
            question: "What is the largest ocean on Earth?",
            correctAnswer: "Pacific Ocean",
            incorrectAnswers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
            difficulty: 2
        }
    ];
    fs.writeFileSync(questionsPath, JSON.stringify(initialQuestions, null, 2));
    console.log(`Created questions.json with initial data`);
}

const server = http.createServer((req, res) => {
    console.log(`Received request for: ${req.url}`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API endpoints
    if (pathname === '/api/questions' && req.method === 'GET') {
        console.log('Handling GET request for /api/questions');
        fs.readFile(questionsPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading questions:', err);
                res.writeHead(500);
                res.end('Error reading questions');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    if (pathname === '/api/questions' && req.method === 'POST') {
        console.log('Handling POST request for /api/questions');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                fs.writeFile(questionsPath, JSON.stringify(data, null, 2), (err) => {
                    if (err) {
                        console.error('Error saving questions:', err);
                        res.writeHead(500);
                        res.end('Error saving questions');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });
            } catch (e) {
                console.error('Invalid JSON:', e);
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
        return;
    }

    // Serve static files
    let filePath;
    
    // Check if it's a request for the root or specific pages
    if (pathname === '/' || pathname === '') {
        filePath = path.join(__dirname, 'public', 'html', 'index.html');
        console.log(`Serving index.html from ${filePath}`);
    } else {
        // Remove leading slash if present
        const cleanPath = pathname.startsWith('/') ? pathname.substring(1) : pathname;
        
        // Try to find the file in the public directory
        filePath = path.join(__dirname, 'public', cleanPath);
        console.log(`Looking for file at ${filePath}`);
    }

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = contentTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            
            if (err.code === 'ENOENT') {
                // Page not found, try redirecting to index.html
                fs.readFile(path.join(__dirname, 'public', 'html', 'index.html'), (err, content) => {
                    if (err) {
                        console.error('Error reading index.html:', err);
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            console.log(`Successfully serving file: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Make sure the following files exist:`);
    console.log(`- ${path.join(__dirname, 'public', 'html', 'index.html')}`);
    console.log(`- ${path.join(__dirname, 'public', 'html', 'admin.html')}`);
    console.log(`- ${path.join(__dirname, 'public', 'css', 'style.css')}`);
    console.log(`- ${path.join(__dirname, 'public', 'js', 'game.js')}`);
    console.log(`- ${path.join(__dirname, 'public', 'js', 'admin.js')}`);
});
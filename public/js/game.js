// Initialize game state variables
let questions = [];
let currentScore = 0;

// Wait for DOM to load and initialize game
document.addEventListener('DOMContentLoaded', initializeGame);

async function initializeGame() {
    try {
        // Load questions from server
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        questions = await response.json();
        console.log('Questions loaded:', questions);

        // Setup event listeners
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.addEventListener('click', startGame);
        } else {
            console.error('Start game button not found');
        }
    } catch (error) {
        console.error('Game initialization failed:', error);
        showError('Failed to load questions. Please try again.');
    }
}

function startGame() {
    currentScore = 0;
    hideElement('start-game');
    showRandomQuestion();
}

function showRandomQuestion() {
    if (!questions.length) {
        showError('No questions available');
        return;
    }

    // Hide welcome text and admin panel
    document.querySelector('h1').style.display = 'none';
    document.querySelector('.description').style.display = 'none';
    document.querySelector('.admin-link').style.display = 'none';

    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('Game container not found');
        return;
    }

    gameContainer.innerHTML = `
        <div class="question-card">
            <h2>${question.text}</h2>
            <div class="answers-grid">
                ${question.answers.map((answer, index) => `
                    <button class="answer-btn" data-index="${index + 1}">
                        ${answer}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Add click handlers to answer buttons
    const answerButtons = gameContainer.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
        button.addEventListener('click', (e) => checkAnswer(e, question));
    });
}

function checkAnswer(event, question) {
    const selectedAnswer = parseInt(event.target.dataset.index);
    
    if (selectedAnswer === question.correctAnswer) {
        currentScore++;
        showRandomQuestion();
    } else {
        showGameOver();
    }
}

function showGameOver() {
    // Show hidden elements again
    document.querySelector('h1').style.display = 'block';
    document.querySelector('.description').style.display = 'block';
    document.querySelector('.admin-link').style.display = 'block';

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    gameContainer.innerHTML = `
        <div class="game-over">
            <h2>Wrong Answer!</h2>
            <button id="play-again" class="play-again-btn">Play Again</button>
        </div>
    `;

    showElement('start-game');

    const playAgainButton = document.getElementById('play-again');
    if (playAgainButton) {
        playAgainButton.addEventListener('click', startGame);
    }
}

// Utility functions
function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'none';
    }
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
    }
}

function showError(message) {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
}
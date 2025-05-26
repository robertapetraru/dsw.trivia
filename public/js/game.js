// Initialize game state variables
let questions = [];
let availableQuestions = []; // Track unused questions
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
    // Reset available questions pool
    availableQuestions = [...questions]; // Create a copy of all questions
    
    // Reset visual score
    document.querySelector('.score').textContent = 'Score: 0';
    hideElement('start-game');
    
    // Hide welcome text and admin panel
    setWelcomeElementsVisibility(false);
    
    showRandomQuestion();
}

function showRandomQuestion() {
    if (!availableQuestions.length) {
        // All questions have been used - show completion message
        showAllQuestionsCompleted();
        return;
    }

    // Get random question from available questions
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    
    // Remove the selected question from available questions
    availableQuestions.splice(randomIndex, 1);
    
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
            <div class="question-counter">
                Întrebări rămase: ${availableQuestions.length}
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
        document.querySelector('.score').textContent = `Score: ${currentScore}`;
        showRandomQuestion();
    } else {
        showGameOver();
    }
}

function showGameOver() {
    // Show welcome elements again
    setWelcomeElementsVisibility(true);

    // Show game over screen
    updateGameContainer(`
        <div class="game-over">
            <h2>Răspuns greșit!</h2>
            <p>Scorul final: ${currentScore}</p>
            <button id="play-again" class="play-again-btn">Joacă din nou</button>
        </div>
    `);
    
    // Setup play again button
    setupPlayAgainButton();
}

function showAllQuestionsCompleted() {
    // Show welcome elements again
    setWelcomeElementsVisibility(true);

    // Show completion screen
    updateGameContainer(`
        <div class="game-completed">
            <h2>Felicitări! 🎉</h2>
            <p>Ai răspuns corect la toate ${currentScore} întrebări!</p>
            <p>Scorul perfect: ${currentScore}/${questions.length}</p>
            <button id="play-again" class="play-again-btn">Joacă din nou</button>
        </div>
    `);
    
    // Setup play again button
    setupPlayAgainButton();
}

// Helper function to set welcome elements visibility
function setWelcomeElementsVisibility(isVisible) {
    const display = isVisible ? 'block' : 'none';
    document.querySelector('h1').style.display = display;
    document.querySelector('.description').style.display = display;
    document.querySelector('.admin-link').style.display = display;
}

// Helper function to update game container
function updateGameContainer(html) {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.innerHTML = html;
    }
}

// Set up play again button
function setupPlayAgainButton() {
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
    updateGameContainer(`<div class="error-message">${message}</div>`);
}
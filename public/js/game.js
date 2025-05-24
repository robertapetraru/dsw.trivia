// Game variables
let questions = [];
let currentQuestion = null;
let score = 0;
let currentDifficulty = 1;

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const questionElement = document.getElementById('question');
const answersContainer = document.getElementById('answers-container');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-game');
const playAgainButton = document.getElementById('play-again');

// Event listeners
startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);

// Load questions from the server
async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        questions = await response.json();
    } catch (error) {
        console.error('Error loading questions:', error);
        questions = []; // Empty array if there's an error
    }
}

// Start the game
async function startGame() {
    // Reset game state
    score = 0;
    currentDifficulty = 1;
    scoreElement.textContent = score;
    
    // Hide/show screens
    welcomeScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Load questions and start first round
    await loadQuestions();
    if (questions.length > 0) {
        nextQuestion();
    } else {
        endGame();
    }
}

// Select and display a random question
function nextQuestion() {
    // Filter questions based on current difficulty (including lower difficulties if needed)
    let availableQuestions = questions.filter(q => q.difficulty <= currentDifficulty);
    
    // If no questions at the current difficulty, increase difficulty
    if (availableQuestions.length === 0 && currentDifficulty < 3) {
        currentDifficulty++;
        availableQuestions = questions.filter(q => q.difficulty <= currentDifficulty);
    }
    
    // If there are no questions available, end the game
    if (availableQuestions.length === 0) {
        endGame();
        return;
    }
    
    // Select a random question
    currentQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Display the question
    questionElement.textContent = currentQuestion.question;
    
    // Create answer buttons
    answersContainer.innerHTML = '';
    
    // Combine all answers and shuffle them
    const allAnswers = [
        currentQuestion.correctAnswer, 
        ...currentQuestion.incorrectAnswers
    ];
    shuffleArray(allAnswers);
    
    // Create buttons for each answer
    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(answer));
        answersContainer.appendChild(button);
    });
    
    // Increase difficulty every 3 correct answers
    if (score > 0 && score % 3 === 0 && currentDifficulty < 3) {
        currentDifficulty++;
    }
}

// Check if the answer is correct
function checkAnswer(selectedAnswer) {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Highlight the buttons
    const buttons = answersContainer.querySelectorAll('.answer-btn');
    buttons.forEach(button => {
        if (button.textContent === currentQuestion.correctAnswer) {
            button.classList.add('correct');
        } else if (button.textContent === selectedAnswer && !isCorrect) {
            button.classList.add('incorrect');
        }
        
        // Disable all buttons
        button.disabled = true;
    });
    
    // Update score and proceed
    if (isCorrect) {
        score++;
        scoreElement.textContent = score;
        
        // Wait a moment before showing the next question
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    } else {
        // Game over
        setTimeout(() => {
            endGame();
        }, 1500);
    }
}

// End the game
function endGame() {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// Global variables for DOM elements
let questionsList;
let questionForm;
let questionDataForm;
let formTitle;
let addQuestionBtn;
let cancelEditBtn;
let questionIdInput;
let questionTextInput;
let correctAnswerInput;
let incorrectAnswerInputs;
let difficultySelect;

// Questions data
let questions = [];

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded - initializing admin panel");
    
    // Get DOM elements
    questionsList = document.getElementById('questionsList');
    questionForm = document.getElementById('questionForm');
    addQuestionBtn = document.getElementById('add-question-btn');
    cancelEditBtn = document.getElementById('cancel-edit');
    
    // Set up event listeners
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
            console.log("Add Question button clicked");
            showAddQuestionForm();
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideQuestionForm);
    }
    
    if (questionForm) {
        questionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await saveQuestion(event);
        });
    }
    
    // Load questions when the page loads
    loadQuestions();
});

// Show the form for adding a new question
function showAddQuestionForm() {
    console.log("Showing add question form");
    
    // Reset form
    if (questionForm) {
        questionForm.reset();
    }
    
    // Show form
    questionForm.classList.remove('hidden');
}

// Hide the question form
function hideQuestionForm() {
    console.log("Hiding question form");
    questionForm.classList.add('hidden');
}

// Load all questions from the server
async function loadQuestions() {
    try {
        console.log("Loading questions from server");
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        questions = await response.json();
        displayQuestions(questions);
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Get difficulty label
function getDifficultyLabel(difficulty) {
    switch (parseInt(difficulty)) {
        case 1: return 'Easy';
        case 2: return 'Medium';
        case 3: return 'Hard';
        default: return 'Unknown';
    }
}

// Delete a question
async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    console.log("Deleting question:", id);
    
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedQuestions)
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete question');
        }
        
        questions = updatedQuestions;
        displayQuestions(questions);
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
    }
}

// Save a question (add or update)
async function saveQuestion(event) {
    event.preventDefault();

    try {
        // Validate form data
        const question = {
            text: document.getElementById('question').value.trim(),
            answers: [
                document.getElementById('answer1').value.trim(),
                document.getElementById('answer2').value.trim(),
                document.getElementById('answer3').value.trim(),
                document.getElementById('answer4').value.trim()
            ],
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        // Check if all fields are filled
        if (!question.text || question.answers.some(answer => !answer)) {
            throw new Error('Please fill in all fields');
        }

        // Validate correct answer
        if (isNaN(question.correctAnswer) || question.correctAnswer < 1 || question.correctAnswer > 4) {
            throw new Error('Correct answer must be between 1 and 4');
        }

        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save question');
        }

        // Clear form on success
        document.getElementById('questionForm').reset();
        await loadQuestions();
        alert('Question saved successfully!');

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to save question');
    }
}

// Function to display questions
function displayQuestions(questions) {
    if (!questionsList) {
        console.error("Questions list element not found");
        return;
    }
    
    questionsList.innerHTML = ''; // Clear existing content

    if (questions.length === 0) {
        questionsList.innerHTML = '<p>No questions available.</p>';
        return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.className = 'questions-grid';

    questions.forEach((question, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <h3>Q${index + 1}</h3>
            <div class="question-text">${question.text}</div>
            <ol class="answers-list">
                ${question.answers.map(answer => `
                    <li>${answer}</li>
                `).join('')}
            </ol>
            <div class="correct-answer">Correct: Answer ${question.correctAnswer}</div>
            <div class="action-buttons">
                <button class="edit-btn" data-id="${question.id || index}">Edit</button>
                <button class="delete-btn" data-id="${question.id || index}">Delete</button>
            </div>
        `;
        gridContainer.appendChild(card);
        
        // Add event listeners to the buttons
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editQuestion(question.id || index);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteQuestion(question.id || index);
            });
        }
    });

    questionsList.appendChild(gridContainer);
}

// Edit a question
function editQuestion(id) {
    const question = questions.find(q => q.id === id || questions.indexOf(q) === id);
    if (!question) return;
    
    console.log("Editing question:", id);
    
    document.getElementById('question').value = question.text;
    
    // Populate answers
    if (question.answers && question.answers.length >= 4) {
        document.getElementById('answer1').value = question.answers[0];
        document.getElementById('answer2').value = question.answers[1];
        document.getElementById('answer3').value = question.answers[2];
        document.getElementById('answer4').value = question.answers[3];
    }
    
    document.getElementById('correctAnswer').value = question.correctAnswer;
    
    questionForm.classList.remove('hidden');
}
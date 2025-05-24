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
    questionsList = document.getElementById('questions-list');
    questionForm = document.getElementById('question-form');
    questionDataForm = document.getElementById('question-data-form');
    formTitle = document.getElementById('form-title');
    addQuestionBtn = document.getElementById('add-question-btn');
    cancelEditBtn = document.getElementById('cancel-edit');
    questionIdInput = document.getElementById('question-id');
    questionTextInput = document.getElementById('question-text');
    correctAnswerInput = document.getElementById('correct-answer');
    incorrectAnswerInputs = document.querySelectorAll('.incorrect-answer');
    difficultySelect = document.getElementById('difficulty');
    
    console.log("Add Question Button found:", addQuestionBtn !== null);
    
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
    
    if (questionDataForm) {
        questionDataForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveQuestion();
        });
    }
    
    // Load questions when the page loads
    loadQuestions();
});

// Show the form for adding a new question
function showAddQuestionForm() {
    console.log("Showing add question form");
    
    // Reset form
    formTitle.textContent = 'Add New Question';
    questionIdInput.value = '';
    questionTextInput.value = '';
    correctAnswerInput.value = '';
    incorrectAnswerInputs.forEach(input => input.value = '');
    difficultySelect.value = '1';
    
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
        displayQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Display questions in the table
function displayQuestions() {
    console.log("Displaying questions:", questions.length);
    questionsList.innerHTML = '';
    
    questions.forEach(question => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${question.id}</td>
            <td>${question.question}</td>
            <td>${question.correctAnswer}</td>
            <td>${getDifficultyLabel(question.difficulty)}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${question.id}">Edit</button>
                <button class="delete-btn" data-id="${question.id}">Delete</button>
            </td>
        `;
        
        questionsList.appendChild(row);
        
        // Add event listeners to the buttons
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editQuestion(question.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteQuestion(question.id);
            });
        }
    });
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

// Edit a question
function editQuestion(id) {
    const question = questions.find(q => q.id === id);
    if (!question) return;
    
    console.log("Editing question:", id);
    
    formTitle.textContent = 'Edit Question';
    questionIdInput.value = question.id;
    questionTextInput.value = question.question;
    correctAnswerInput.value = question.correctAnswer;
    
    // Populate incorrect answers
    question.incorrectAnswers.forEach((answer, index) => {
        if (index < incorrectAnswerInputs.length) {
            incorrectAnswerInputs[index].value = answer;
        }
    });
    
    difficultySelect.value = question.difficulty;
    
    questionForm.classList.remove('hidden');
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
        displayQuestions();
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
    }
}

// Save a question (add or update)
async function saveQuestion() {
    console.log("Saving question");
    
    // Get values from form
    const id = questionIdInput.value ? parseInt(questionIdInput.value) : Date.now();
    const question = questionTextInput.value;
    const correctAnswer = correctAnswerInput.value;
    const incorrectAnswers = Array.from(incorrectAnswerInputs).map(input => input.value);
    const difficulty = parseInt(difficultySelect.value);
    
    // Create the question object
    const questionData = {
        id,
        question,
        correctAnswer,
        incorrectAnswers,
        difficulty
    };
    
    console.log("Question data:", questionData);
    
    // Update or add the question
    let updatedQuestions;
    if (questionIdInput.value) {
        // Update existing question
        updatedQuestions = questions.map(q => q.id === id ? questionData : q);
    } else {
        // Add new question
        updatedQuestions = [...questions, questionData];
    }
    
    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedQuestions)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save question');
        }
        
        questions = updatedQuestions;
        displayQuestions();
        hideQuestionForm();
    } catch (error) {
        console.error('Error saving question:', error);
        alert('Failed to save question');
    }
}

// Simplified admin.js to focus just on the button functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin.js loaded");
    
    // Get important DOM elements
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionForm = document.getElementById('question-form');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // Show the form when "Add New Question" is clicked
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
            console.log("Add button clicked from admin.js");
            if (questionForm) {
                questionForm.classList.remove('hidden');
            }
        });
    }
    
    // Hide the form when "Cancel" is clicked
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            if (questionForm) {
                questionForm.classList.add('hidden');
            }
        });
    }
    
    // Load questions initially
    loadQuestions();
});

// Simple placeholder functions
async function loadQuestions() {
    console.log("Loading questions...");
    try {
        const response = await fetch('/api/questions');
        const questions = await response.json();
        displayQuestions(questions);
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

function displayQuestions(questions) {
    console.log("Displaying questions:", questions);
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    
    questions.forEach(question => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${question.id}</td>
            <td>${question.question}</td>
            <td>${question.correctAnswer}</td>
            <td>${question.difficulty}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        questionsList.appendChild(row);
    });
}
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

document.addEventListener('DOMContentLoaded', () => {
    const questionForm = document.getElementById('questionForm');
    
    // Load existing questions when page loads
    loadQuestions();

    questionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const questionData = {
            text: document.getElementById('question').value,
            answers: [
                document.getElementById('answer1').value,
                document.getElementById('answer2').value,
                document.getElementById('answer3').value,
                document.getElementById('answer4').value
            ],
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            if (result.success) {
                alert('Question saved successfully!');
                questionForm.reset();
                // Reload questions after saving
                loadQuestions();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save question: ' + error.message);
        }
    });
});

// Function to load questions
async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        const questions = await response.json();
        displayQuestions(questions);
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Function to display questions
function displayQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
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
            <div class="correct-answer">Correct: ${question.correctAnswer}</div>
        `;
        gridContainer.appendChild(card);
    });

    questionsList.appendChild(gridContainer);
}
// Quiz Questions
const quizQuestions = [
    {
        question: "What is your primary reason for immigration?",
        options: [
            "Work and career opportunities",
            "Education and academic pursuits",
            "Family reunification",
            "Better quality of life"
        ]
    },
    {
        question: "Which country are you most interested in immigrating to?",
        options: [
            "United States",
            "Canada",
            "Australia",
            "United Kingdom"
        ]
    },
    {
        question: "What is your current education level?",
        options: [
            "High School",
            "Bachelor's Degree",
            "Master's Degree",
            "Doctorate/PhD"
        ]
    },
    {
        question: "How many years of work experience do you have?",
        options: [
            "Less than 1 year",
            "1-3 years",
            "4-7 years",
            "8+ years"
        ]
    },
    {
        question: "What is your proficiency in English?",
        options: [
            "Basic (Beginner)",
            "Intermediate",
            "Advanced",
            "Native/Fluent"
        ]
    }
];

// Application State
let currentQuestionIndex = 0;
let userAnswers = [];
let userInfo = {};
let timerInterval = null;
let timeRemaining = 30;
let isQuizActive = false; // Track if quiz is currently active
let exitIntentHandler = null; // Store exit intent handler reference

// DOM Elements
const landingPage = document.getElementById('landing-page');
const formPage = document.getElementById('form-page');
const quizPage = document.getElementById('quiz-page');
const resultsPage = document.getElementById('results-page');
const startNowBtn = document.getElementById('start-now-btn');
const userForm = document.getElementById('user-form');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionNumber = document.getElementById('question-number');
const timer = document.getElementById('timer');
const progressFill = document.getElementById('progress-fill');
const resultsMessage = document.getElementById('results-message');
const restartBtn = document.getElementById('restart-btn');

// Event Listeners
startNowBtn.addEventListener('click', () => {
    hideUserAlreadyTakenError();
    showPage('form-page');
});

userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userInfo = {
        name: document.getElementById('name').value.trim(),
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim()
    };

    // Check if user has already taken the quiz
    if (hasUserTakenQuiz(userInfo)) {
        showUserAlreadyTakenError();
        return;
    }

    startQuiz();
});

restartBtn.addEventListener('click', () => {
    resetQuiz();
    showPage('landing-page');
});

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Quiz Functions
function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    isQuizActive = true;
    // Store quiz start time
    userInfo.quizStartTime = new Date().toISOString();
    showPage('quiz-page');
    loadQuestion();
    // Add exit intent detection
    addExitIntentListener();

    // Send initial submission to endpoint 2 (quiz started)
    sendWebhookEndpoint2('quiz_started', {
        user: userInfo,
        timestamp: userInfo.quizStartTime
    });
}

function loadQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        finishQuiz();
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    questionText.textContent = question.question;
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;

    // Clear and populate options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });

    // Start timer
    startTimer();
}

function selectOption(optionIndex) {
    // Disable all options
    document.querySelectorAll('.option').forEach(option => {
        option.classList.add('disabled');
        option.style.pointerEvents = 'none';
    });

    // Mark selected option
    const selectedOption = optionsContainer.children[optionIndex];
    selectedOption.classList.add('selected');

    // Save answer
    userAnswers[currentQuestionIndex] = {
        question: quizQuestions[currentQuestionIndex].question,
        selectedOption: quizQuestions[currentQuestionIndex].options[optionIndex],
        optionIndex: optionIndex
    };

    // Send real-time update to webhook endpoint 2 (Google Sheets)
    sendWebhookEndpoint2('question_answered', {
        questionNumber: currentQuestionIndex + 1,
        question: quizQuestions[currentQuestionIndex].question,
        answer: quizQuestions[currentQuestionIndex].options[optionIndex],
        timestamp: new Date().toISOString()
    });

    // Move to next question after a short delay
    clearInterval(timerInterval);
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1000);
}

function startTimer() {
    timeRemaining = 30;
    timer.textContent = timeRemaining;
    timer.classList.remove('warning');

    timerInterval = setInterval(() => {
        timeRemaining--;
        timer.textContent = timeRemaining;

        if (timeRemaining <= 10) {
            timer.classList.add('warning');
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            // Auto-select first option or mark as unanswered
            if (!userAnswers[currentQuestionIndex]) {
                userAnswers[currentQuestionIndex] = {
                    question: quizQuestions[currentQuestionIndex].question,
                    selectedOption: 'No answer (Time expired)',
                    optionIndex: -1
                };

                // Send real-time update to webhook endpoint 2 (time expired)
                sendWebhookEndpoint2('time_expired', {
                    questionNumber: currentQuestionIndex + 1,
                    question: quizQuestions[currentQuestionIndex].question,
                    answer: 'No answer (Time expired)',
                    timestamp: new Date().toISOString()
                });
            }
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 500);
        }
    }, 1000);
}

function finishQuiz() {
    clearInterval(timerInterval);
    isQuizActive = false;
    // Remove exit intent listener
    removeExitIntentListener();
    // Mark user as completed before showing results
    markUserAsCompleted(userInfo);

    // Prepare quiz submission data
    const submissionData = prepareSubmissionData(false);

    // Send to webhook endpoint 1 (Email service) - only on completion
    sendWebhookEndpoint1(submissionData);

    // Send to webhook endpoint 2 (Google Sheets) - real-time completion update
    sendWebhookEndpoint2('quiz_completed', submissionData);

    showPage('results-page');
    displayResults();
    sendEmail();
}

// Function to finish quiz early (when user tries to exit)
function finishQuizEarly() {
    clearInterval(timerInterval);
    isQuizActive = false;

    // Fill in any unanswered questions
    for (let i = 0; i < quizQuestions.length; i++) {
        if (!userAnswers[i]) {
            userAnswers[i] = {
                question: quizQuestions[i].question,
                selectedOption: 'Quiz incomplete - window closed',
                optionIndex: -1
            };
        }
    }

    // Mark user as completed
    markUserAsCompleted(userInfo);

    // Prepare partial submission data
    const submissionData = prepareSubmissionData(true);

    // Send to webhook endpoint 2 (Google Sheets) - partial submission
    sendWebhookEndpoint2('quiz_partial', submissionData);

    // Note: Do NOT send to endpoint 1 (email) for partial submissions

    // Show results page
    showPage('results-page');
    displayResults();
    sendEmail();
}

function displayResults() {
    // Quiz summary is hidden - results are not displayed on screen
    // User is already marked as completed in finishQuiz()
}

function resetQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    userInfo = {};
    isQuizActive = false;
    clearInterval(timerInterval);
    userForm.reset();
    progressFill.style.width = '20%';
    // Hide any error messages
    hideUserAlreadyTakenError();
    // Remove exit intent listener
    removeExitIntentListener();
}

// Exit Intent Detection Functions
function addExitIntentListener() {
    // Handle beforeunload event (when user tries to close window/tab)
    exitIntentHandler = (e) => {
        if (isQuizActive) {
            // Finish the quiz automatically when user tries to close
            finishQuizEarly();
        }
    };

    window.addEventListener('beforeunload', exitIntentHandler);

    // Handle pagehide event (more reliable than beforeunload - fires later in unload process)
    window.addEventListener('pagehide', () => {
        if (isQuizActive) {
            finishQuizEarly();
        }
    });

    // Handle visibility change (tab switching, minimizing window, closing window)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isQuizActive) {
            // User switched tabs, minimized, or closed window - finish quiz
            finishQuizEarly();
        }
    });

    // Also detect mouse leaving the top of the window (classic exit intent)
    let mouseLeaveTimer = null;
    document.addEventListener('mouseleave', (e) => {
        if (isQuizActive && e.clientY < 0) {
            // Mouse left the top of the window
            clearTimeout(mouseLeaveTimer);
            mouseLeaveTimer = setTimeout(() => {
                if (isQuizActive) {
                    finishQuizEarly();
                }
            }, 500); // Wait 500ms to avoid false positives
        }
    });

    document.addEventListener('mouseenter', () => {
        // Cancel timer if mouse comes back
        clearTimeout(mouseLeaveTimer);
    });

    // Detect keyboard shortcuts that might close the window (Ctrl+W, Alt+F4, etc.)
    document.addEventListener('keydown', (e) => {
        if (isQuizActive) {
            // Check for window closing shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                // Ctrl+W or Cmd+W (close tab)
                finishQuizEarly();
            } else if (e.altKey && (e.key === 'F4' || e.key === 'f4')) {
                // Alt+F4 (close window)
                finishQuizEarly();
            }
        }
    });
}

function removeExitIntentListener() {
    if (exitIntentHandler) {
        window.removeEventListener('beforeunload', exitIntentHandler);
        exitIntentHandler = null;
    }
}

// User completion tracking functions
function getUserIdentifier(userInfo) {
    // Create a unique identifier based on name, age, and gender
    return `${userInfo.name.toLowerCase().trim()}_${userInfo.age}_${userInfo.gender}`;
}

function hasUserTakenQuiz(userInfo) {
    const completedUsers = getCompletedUsers();
    const userIdentifier = getUserIdentifier(userInfo);
    return completedUsers.includes(userIdentifier);
}

function markUserAsCompleted(userInfo) {
    const completedUsers = getCompletedUsers();
    const userIdentifier = getUserIdentifier(userInfo);

    if (!completedUsers.includes(userIdentifier)) {
        completedUsers.push(userIdentifier);
        localStorage.setItem('quiz_completed_users', JSON.stringify(completedUsers));
    }
}

function getCompletedUsers() {
    const stored = localStorage.getItem('quiz_completed_users');
    return stored ? JSON.parse(stored) : [];
}

function showUserAlreadyTakenError() {
    // Remove any existing error message
    hideUserAlreadyTakenError();

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.id = 'already-taken-error';
    errorDiv.style.cssText = `
        background: #fee;
        border: 2px solid #f5576c;
        color: #c00;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ You have already taken this quiz!</strong><br>
        <small>Each person can only take the quiz once. Please use different details if you want to take it again.</small>
    `;

    const formContainer = document.querySelector('.form-container');
    const form = document.getElementById('user-form');
    formContainer.insertBefore(errorDiv, form);

    // Focus on name field
    document.getElementById('name').focus();
}

function hideUserAlreadyTakenError() {
    const errorDiv = document.getElementById('already-taken-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Email Functionality
// Load email configuration from config.js (if available)
let emailConfig = window.emailConfig || {
    enabled: false,
    serviceId: '',
    templateId: '',
    publicKey: '',
    recipientEmail: ''
};

// Webhook Configuration
// Load webhook configuration from config.js (if available)
let webhookConfig = window.webhookConfig || {
    endpoint1: '',
    endpoint2: '',
    enabled: false
};

function generatePDF() {
    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set up styling
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Immigration Quiz Results', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // User Information Section
    let yPos = 35;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('User Information', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${userInfo.name}`, 20, yPos);
    yPos += 7;
    doc.text(`Phone: ${userInfo.phone || 'Not provided'}`, 20, yPos);
    yPos += 7;
    doc.text(`Email: ${userInfo.email || 'Not provided'}`, 20, yPos);
    yPos += 7;
    doc.text(`Age: ${userInfo.age}`, 20, yPos);
    yPos += 7;
    doc.text(`Gender: ${userInfo.gender}`, 20, yPos);
    yPos += 10;

    // Quiz Answers Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Quiz Answers', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    userAnswers.forEach((answer, index) => {
        // Check if we need a new page
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        // Question
        doc.setFont(undefined, 'bold');
        const questionText = `Q${index + 1}: ${answer.question}`;
        const questionLines = doc.splitTextToSize(questionText, 170);
        doc.text(questionLines, 20, yPos);
        yPos += questionLines.length * 6;

        // Answer
        doc.setFont(undefined, 'normal');
        const answerText = `Answer: ${answer.selectedOption}`;
        const answerLines = doc.splitTextToSize(answerText, 165);
        doc.text(answerLines, 25, yPos);
        yPos += answerLines.length * 6;

        // Add spacing between questions
        yPos += 8;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
    }

    // Generate PDF as base64 string
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    return {
        base64: pdfBase64,
        dataUri: doc.output('datauristring'),
        filename: `Quiz_Results_${userInfo.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        doc: doc
    };
}

function sendEmail() {
    // Prepare email content
    let emailBody = `Quiz Results\n\n`;
    emailBody += `User Information:\n`;
    emailBody += `Name: ${userInfo.name}\n`;
    emailBody += `Age: ${userInfo.age}\n`;
    emailBody += `Gender: ${userInfo.gender}\n\n`;
    emailBody += `Quiz Answers:\n\n`;

    userAnswers.forEach((answer, index) => {
        emailBody += `Question ${index + 1}: ${answer.question}\n`;
        emailBody += `Answer: ${answer.selectedOption}\n\n`;
    });

    // Generate PDF
    const pdfData = generatePDF();

    // Check if EmailJS is configured
    if (window.emailjs && emailConfig.enabled && emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey) {
        // Initialize EmailJS
        emailjs.init(emailConfig.publicKey);

        // Prepare email template parameters
        // Use the recipient email from config - hardcode to ensure it's correct
        const recipientEmail = emailConfig.recipientEmail || 'piyushdigital.arogyam@gmail.com';

        // Include PDF data as base64 for email attachment
        const templateParams = {
            to_email: recipientEmail,
            to_name: 'Administrator',
            subject: "Immigration Quiz Results - " + userInfo.name,
            message: emailBody,
            user_name: userInfo.name,
            user_age: userInfo.age,
            user_gender: userInfo.gender,
            quiz_results: emailBody,
            from_name: "Immigration Quiz System",
            reply_to: recipientEmail,
            pdf_filename: pdfData.filename,
            pdf_base64: pdfData.base64,
            // PDF data URL for email template (can be used as link or attachment)
            pdf_link: pdfData.dataUri
        };

        console.log('Sending email to:', recipientEmail);
        console.log('Template params:', templateParams);

        // Send email - PDF attachment will be handled by email service
        // Note: For PDF attachments, you may need to use EmailJS REST API
        // or configure your email service template to handle base64 attachments
        emailjs.send(emailConfig.serviceId, emailConfig.templateId, templateParams)
            .then((response) => {
                console.log('Email sent successfully!', response);
                console.log('Email sent to:', recipientEmail);
                resultsMessage.innerHTML = `
                Your quiz has been completed!<br><br>
                <strong style="color: #4caf50;">Quiz results PDF has been sent to ${recipientEmail}</strong>
            `;
                resultsMessage.style.color = "#4caf50";
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
                console.error('Error details:', {
                    status: error.status,
                    text: error.text,
                    recipient: recipientEmail
                });

                let errorMessage = "There was an error sending your results. ";

                if (error.text && error.text.includes('email')) {
                    errorMessage += `Make sure the "To Email" field in your EmailJS template is set to: ${recipientEmail} or use {{to_email}} variable.`;
                } else {
                    errorMessage += "Please check your EmailJS configuration and try again later.";
                }

                resultsMessage.innerHTML = `
                <strong style="color: #f5576c;">Error sending email</strong><br>
                <small style="color: #666; margin-top: 10px; display: block;">
                    ${errorMessage}<br><br>
                    Error: ${error.text || error.message || 'Unknown error'}<br>
                    Expected recipient: ${recipientEmail}
                </small>
            `;
                resultsMessage.style.color = "#f5576c";
            });
    } else {
        // EmailJS not configured - PDF generated but not sent
        console.log('Quiz results prepared for email:');
        console.log(emailBody);
        console.log('PDF generated:', pdfData.filename);
        console.log('PDF should be sent to:', emailConfig.recipientEmail);

        // Do NOT download PDF - it should only be sent via email
        resultsMessage.innerHTML = `
            Your quiz has been completed!<br><br>
            <small style="color: #666; margin-top: 10px; display: block;">
                To receive quiz results PDF at <strong>${emailConfig.recipientEmail}</strong>,<br>
                please configure EmailJS in config.js<br>
                See README.md for setup instructions.<br><br>
                <strong>Note:</strong> Results are sent to ${emailConfig.recipientEmail} only.
            </small>
        `;
        resultsMessage.style.color = "#666";
    }
}

// Webhook Functions
function prepareSubmissionData(isPartial = false) {
    const totalQuestions = quizQuestions.length;
    const answeredQuestions = userAnswers.length;
    const completionPercentage = (answeredQuestions / totalQuestions) * 100;

    return {
        user: {
            name: userInfo.name,
            age: userInfo.age,
            gender: userInfo.gender
        },
        quiz: {
            status: isPartial ? 'partial' : 'completed',
            totalQuestions: totalQuestions,
            answeredQuestions: answeredQuestions,
            unansweredQuestions: totalQuestions - answeredQuestions,
            completionPercentage: Math.round(completionPercentage)
        },
        answers: userAnswers.map((answer, index) => ({
            questionNumber: index + 1,
            question: answer.question,
            answer: answer.selectedOption,
            timestamp: new Date().toISOString()
        })),
        metadata: {
            submissionTime: new Date().toISOString(),
            isPartial: isPartial,
            quizStartTime: userInfo.quizStartTime || new Date().toISOString()
        }
    };
}

// Send to Webhook Endpoint 1 (Email Service) - Only on quiz completion
function sendWebhookEndpoint1(submissionData) {
    if (!webhookConfig.enabled || !webhookConfig.endpoint1) {
        console.log('Webhook endpoint 1 not configured or disabled');
        return;
    }

    // Only send on full completion, not partial
    if (submissionData.quiz.status !== 'completed') {
        console.log('Skipping endpoint 1 - submission is partial');
        return;
    }

    const payload = {
        type: 'quiz_completion',
        recipientEmail: emailConfig.recipientEmail || 'piyushdigital.arogyam@gmail.com',
        subject: `Immigration Quiz Results - ${submissionData.user.name}`,
        submission: submissionData,
        timestamp: new Date().toISOString()
    };

    fetch(webhookConfig.endpoint1, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Webhook endpoint 1 (email) sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending to webhook endpoint 1 (email):', error);
        });
}

// Send to Webhook Endpoint 2 (Google Sheets) - Real-time updates
function sendWebhookEndpoint2(eventType, data) {
    if (!webhookConfig.enabled || !webhookConfig.endpoint2) {
        console.log('Webhook endpoint 2 not configured or disabled');
        return;
    }

    let payload;

    if (eventType === 'question_answered' || eventType === 'time_expired') {
        // Real-time question update - format for Google Sheets
        payload = {
            timestamp: new Date().toISOString(),
            event: eventType,
            name: userInfo.name || '',
            phone: userInfo.phone || '',
            email: userInfo.email || '',
            age: userInfo.age || '',
            gender: userInfo.gender || '',
            questionNumber: data.questionNumber || currentQuestionIndex + 1,
            question: data.question || '',
            selectedOption: data.answer || data.selectedOption || '',
            currentProgress: userAnswers.length,
            totalQuestions: quizQuestions.length
        };
    } else if (eventType === 'quiz_completed' || eventType === 'quiz_partial') {
        // Full or partial submission - format for Google Sheets
        // Flat structure - all data in one row for easy sheet reading
        payload = {
            // User Information
            name: userInfo.name || '',
            phone: userInfo.phone || '',
            email: userInfo.email || '',
            age: userInfo.age || '',
            gender: userInfo.gender || '',

            // Quiz Status
            status: eventType === 'quiz_completed' ? 'Completed' : 'Partial',
            totalQuestions: quizQuestions.length.toString(),
            answeredQuestions: userAnswers.length.toString(),

            // Question 1
            question1: quizQuestions[0]?.question || '',
            answer1: userAnswers[0]?.selectedOption || 'Not answered',

            // Question 2
            question2: quizQuestions[1]?.question || '',
            answer2: userAnswers[1]?.selectedOption || 'Not answered',

            // Question 3
            question3: quizQuestions[2]?.question || '',
            answer3: userAnswers[2]?.selectedOption || 'Not answered',

            // Question 4
            question4: quizQuestions[3]?.question || '',
            answer4: userAnswers[3]?.selectedOption || 'Not answered',

            // Question 5
            question5: quizQuestions[4]?.question || '',
            answer5: userAnswers[4]?.selectedOption || 'Not answered',

            // Additional Info
            submissionTime: new Date().toISOString(),
            quizStartTime: userInfo.quizStartTime || new Date().toISOString()
        };
    } else if (eventType === 'quiz_started') {
        // Quiz started
        payload = {
            timestamp: new Date().toISOString(),
            event: 'Quiz Started',
            name: userInfo.name || '',
            phone: userInfo.phone || '',
            email: userInfo.email || '',
            age: userInfo.age || '',
            gender: userInfo.gender || ''
        };
    } else {
        // Generic payload
        payload = {
            timestamp: new Date().toISOString(),
            event: eventType,
            data: JSON.stringify(data)
        };
    }

    // Log the payload being sent
    console.log(`📤 Sending to Google Sheets (${eventType}):`, payload);
    console.log(`🔗 Webhook URL:`, webhookConfig.endpoint2);
    console.log(`📋 Full Payload:`, JSON.stringify(payload, null, 2));

    // Send to Google Sheets webhook
    // NOTE: Using mode: 'no-cors' to avoid CORS errors. 
    // This results in an opaque response (status 0), so we cannot read the return data.
    fetch(webhookConfig.endpoint2, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            // With no-cors, we get an opaque response. We assume success if the fetch didn't throw.
            console.log(`✅ Google Sheets webhook request sent (opaque response).`);
            console.log(`✅ Data saved to sheet!`);
        })
        .catch(error => {
            console.error(`❌ Error sending to Google Sheets webhook for ${eventType}:`, error);
            console.error(`❌ Error details:`, {
                message: error.message,
                stack: error.stack,
                payload: payload
            });
            // Note: In no-cors mode, we mostly only catch network errors (like offline), not HTTP errors.
        });
}

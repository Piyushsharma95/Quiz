# Webhook Setup Guide

This guide explains how to configure and use the two webhook endpoints for the quiz application.

## Overview

- **Endpoint 1**: Email service webhook (quiz completion only)
- **Endpoint 2**: Google Sheets webhook (real-time submissions)

## Configuration

Open `config.js` and update the webhook configuration:

```javascript
window.webhookConfig = {
    endpoint1: 'https://your-email-service.com/webhook',  // Email webhook URL
    endpoint2: 'https://script.google.com/macros/s/ABC123/exec',  // Google Sheets webhook URL
    enabled: true  // Set to true to enable webhooks
};
```

## Endpoint 1 - Email Service (Quiz Completion Only)

### When It's Called
- ✅ When quiz is **fully completed** (all 5 questions answered)
- ❌ NOT called for partial submissions
- ❌ NOT called when user exits early

### Request Format

**Method**: `POST`  
**Content-Type**: `application/json`

**Payload Structure**:
```json
{
  "type": "quiz_completion",
  "recipientEmail": "piyushdigital.arogyam@gmail.com",
  "subject": "Immigration Quiz Results - John Doe",
  "submission": {
    "user": {
      "name": "John Doe",
      "age": "30",
      "gender": "male"
    },
    "quiz": {
      "status": "completed",
      "totalQuestions": 5,
      "answeredQuestions": 5,
      "unansweredQuestions": 0,
      "completionPercentage": 100
    },
    "answers": [
      {
        "questionNumber": 1,
        "question": "What is your primary reason for immigration?",
        "answer": "Work and career opportunities",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      // ... more answers
    ],
    "metadata": {
      "submissionTime": "2024-01-15T10:32:00.000Z",
      "isPartial": false,
      "quizStartTime": "2024-01-15T10:28:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:32:00.000Z"
}
```

## Endpoint 2 - Google Sheets (Real-Time)

### When It's Called
- ✅ When quiz **starts** (`quiz_started`)
- ✅ When each **question is answered** (`question_answered`)
- ✅ When **time expires** on a question (`time_expired`)
- ✅ When quiz is **completed** (`quiz_completed`)
- ✅ When user **exits early** (`quiz_partial`)

### Request Format - Question Answered

**Method**: `POST`  
**Content-Type**: `application/json`

**Payload Structure**:
```json
{
  "type": "question_answered",
  "user": {
    "name": "John Doe",
    "age": "30",
    "gender": "male"
  },
  "questionData": {
    "questionNumber": 1,
    "question": "What is your primary reason for immigration?",
    "answer": "Work and career opportunities",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "currentProgress": {
    "questionNumber": 2,
    "totalQuestions": 5,
    "answeredQuestions": 1
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Request Format - Quiz Completed

**Payload Structure**:
```json
{
  "type": "quiz_completed",
  "submission": {
    "user": {
      "name": "John Doe",
      "age": "30",
      "gender": "male"
    },
    "quiz": {
      "status": "completed",
      "totalQuestions": 5,
      "answeredQuestions": 5,
      "unansweredQuestions": 0,
      "completionPercentage": 100
    },
    "answers": [
      // ... all answers
    ],
    "metadata": {
      "submissionTime": "2024-01-15T10:32:00.000Z",
      "isPartial": false,
      "quizStartTime": "2024-01-15T10:28:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:32:00.000Z"
}
```

### Request Format - Quiz Partial (Early Exit)

**Payload Structure**:
```json
{
  "type": "quiz_partial",
  "submission": {
    "user": {
      "name": "John Doe",
      "age": "30",
      "gender": "male"
    },
    "quiz": {
      "status": "partial",
      "totalQuestions": 5,
      "answeredQuestions": 2,
      "unansweredQuestions": 3,
      "completionPercentage": 40
    },
    "answers": [
      // ... answered questions only
    ],
    "metadata": {
      "submissionTime": "2024-01-15T10:30:00.000Z",
      "isPartial": true,
      "quizStartTime": "2024-01-15T10:28:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Request Format - Time Expired

**Payload Structure**:
```json
{
  "type": "time_expired",
  "user": {
    "name": "John Doe",
    "age": "30",
    "gender": "male"
  },
  "questionData": {
    "questionNumber": 3,
    "question": "What is your current education level?",
    "answer": "No answer (Time expired)",
    "timestamp": "2024-01-15T10:31:00.000Z"
  },
  "currentProgress": {
    "questionNumber": 4,
    "totalQuestions": 5,
    "answeredQuestions": 2
  },
  "timestamp": "2024-01-15T10:31:00.000Z"
}
```

## Google Sheets Webhook Setup

### Option 1: Google Apps Script (Recommended)

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Go to **Extensions** → **Apps Script**
4. Create a new script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Handle different event types
    if (data.type === 'quiz_started') {
      sheet.appendRow([
        new Date(),
        'Quiz Started',
        data.data.user.name,
        data.data.user.age,
        data.data.user.gender,
        '-',
        '-',
        data.data.timestamp
      ]);
    } else if (data.type === 'question_answered') {
      sheet.appendRow([
        new Date(),
        'Question Answered',
        data.user.name,
        data.user.age,
        data.user.gender,
        data.questionData.questionNumber,
        data.questionData.answer,
        data.timestamp
      ]);
    } else if (data.type === 'quiz_completed' || data.type === 'quiz_partial') {
      // Add full submission
      data.submission.answers.forEach(function(answer) {
        sheet.appendRow([
          new Date(),
          data.type,
          data.submission.user.name,
          data.submission.user.age,
          data.submission.user.gender,
          answer.questionNumber,
          answer.answer,
          answer.timestamp
        ]);
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Click **Deploy** → **New deployment**
6. Select type: **Web app**
7. Set **Execute as**: Me
8. Set **Who has access**: Anyone
9. Click **Deploy**
10. Copy the **Web app URL** and paste it in `config.js` as `endpoint2`

### Option 2: Using Zapier/Make.com

1. Create a Zapier/Make.com account
2. Create a new Zap/Scenario
3. Set trigger: **Webhooks by Zapier** → **Catch Hook**
4. Add action: **Google Sheets** → **Add Row**
5. Map the fields from webhook data
6. Copy the webhook URL to `config.js`

## Testing

1. Update `config.js` with your webhook URLs
2. Set `enabled: true` in webhookConfig
3. Open browser console (F12)
4. Take the quiz
5. Check console logs for webhook calls
6. Verify data in your email service and Google Sheets

## Troubleshooting

### Webhooks not sending
- Check that `enabled: true` in webhookConfig
- Verify webhook URLs are correct
- Check browser console for error messages
- Ensure CORS is enabled on your webhook endpoints

### Endpoint 1 not receiving data
- Endpoint 1 only sends on **complete** quiz submissions
- Partial submissions will NOT trigger endpoint 1
- Check that `quiz.status === 'completed'` in the payload

### Endpoint 2 not receiving data
- Endpoint 2 sends in real-time for all events
- Check Google Apps Script deployment settings
- Verify webhook URL is correct
- Check Apps Script execution logs

## Data Flow Summary

```
User starts quiz
    ↓
[Endpoint 2] quiz_started event
    ↓
User answers question 1
    ↓
[Endpoint 2] question_answered event (real-time)
    ↓
User answers question 2
    ↓
[Endpoint 2] question_answered event (real-time)
    ↓
... (continues for all questions)
    ↓
Quiz completes
    ↓
[Endpoint 1] quiz_completion (email)
    ↓
[Endpoint 2] quiz_completed (Google Sheets)
```

If user exits early:
```
User exits/closes window
    ↓
[Endpoint 2] quiz_partial event (Google Sheets only)
    ↓
[Endpoint 1] NOT called (no email)
```


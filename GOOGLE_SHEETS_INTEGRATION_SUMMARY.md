# Google Sheets Integration Summary

## Overview
We have successfully integrated the Google Sheets webhook into your Quiz application. The application is now configured to send data to your Google Sheet in real-time.

## Configuration
- **API URL**: `https://script.google.com/macros/s/AKfycbzxDI9ejzv08GVHaCXO_m-QGzs_yd86knp-1YM7tUNOMVdu1mtFX9i9e3UQpcQLuhg-/exec`
- **File**: `config.js`
- **Status**: Enabled

## Data Flow
The application sends data to your Google Sheet at three key moments:

1.  **Quiz Start**: When a user fills out the form and starts the quiz.
    - Sends: User details (Name, Age, Gender, etc.) and "Quiz Started" event.

2.  **Question Answered**: Immediately after a user selects an option for a question.
    - Sends: User details, Question text, Selected Option, and Timestamp.
    - This ensures you capture data even if the user drops off halfway.

3.  **Quiz Completion**: When the user finishes the quiz (or exits early).
    - Sends: A complete summary row with User details and ALL questions and answers (Question 1, Answer 1, Question 2, Answer 2, etc.).

## Code Changes
- **`config.js`**: Verified the Webhook URL matches your provided API.
- **`script.js`**: Cleaned up duplicate code to ensure the correct data format is sent. The application now sends a "flat" data structure (e.g., `name`, `question`, `answer`) which is easier to read in Google Sheets compared to nested JSON.

## Next Steps
1.  **Test the Quiz**: Open `index.html` in your browser.
2.  **Check your Sheet**: Fill out the form and answer a few questions. You should see rows appearing in your Google Sheet.
    - You might see multiple rows per user: one for starting, one for each answer, and one for the final completion.
    - You can filter the Sheet by the "event" or "status" column to analyze the data.

## Troubleshooting
- If data doesn't appear, check the **Browser Console** (F12 -> Console tab) for any error messages starting with "❌ Error sending to Google Sheets".
- Ensure your Google Apps Script is deployed as a **Web App** with "Execute as: Me" and "Who has access: Anyone".

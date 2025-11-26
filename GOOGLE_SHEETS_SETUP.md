# Google Sheets Setup Guide

Yeh guide aapko dikhayega ki kaise Google Sheets mein data automatically save hoga.

## Data Format

Jab quiz complete hota hai, yeh data Google Sheets mein jayega:

### Columns:
1. **Timestamp** - Entry ka time
2. **Event** - quiz_completed ya quiz_partial
3. **Name** - User ka naam
4. **Phone** - User ka phone number
5. **Email** - User ka email address
6. **Age** - User ki age
7. **Gender** - User ka gender
8. **Status** - Completed ya Partial
9. **Total Questions** - Total questions (5)
10. **Answered Questions** - Kitne questions answer kiye
11. **Question 1** - Pehle question ka answer
12. **Question 2** - Doosre question ka answer
13. **Question 3** - Teesre question ka answer
14. **Question 4** - Chauth question ka answer
15. **Question 5** - Paanchve question ka answer
16. **All Answers** - Sab answers ek saath

## Google Apps Script Setup

### Step 1: Google Sheet Banayein

1. [Google Sheets](https://sheets.google.com) par jayein
2. New spreadsheet banayein
3. Pehli row mein headers add karein:
   - Timestamp
   - Event
   - Name
   - Phone
   - Email
   - Age
   - Gender
   - Status
   - Total Questions
   - Answered Questions
   - Question 1
   - Question 2
   - Question 3
   - Question 4
   - Question 5
   - All Answers

### Step 2: Apps Script Code

1. **Extensions** → **Apps Script** par click karein
2. Purana code delete karein
3. Naya code paste karein:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Check if this is a quiz completion or partial submission
    if (data.event === 'quiz_completed' || data.event === 'quiz_partial') {
      // Add complete row to sheet
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.event || '',
        data.name || '',
        data.phone || '',
        data.email || '',
        data.age || '',
        data.gender || '',
        data.status || '',
        data.totalQuestions || '',
        data.answeredQuestions || '',
        data.answer1 || 'Not answered',
        data.answer2 || 'Not answered',
        data.answer3 || 'Not answered',
        data.answer4 || 'Not answered',
        data.answer5 || 'Not answered',
        '' // All Answers column (optional, not currently sent)
      ]);
    } else if (data.event === 'question_answered' || data.event === 'time_expired') {
      // Optional: Log individual question answers in real-time
      // You can create a separate sheet for this if needed
      var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Question Logs');
      if (!logSheet) {
        logSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Question Logs');
        logSheet.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Question Number', 'Question', 'Selected Option']);
      }
      logSheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.name || '',
        data.phone || '',
        data.email || '',
        data.questionNumber || '',
        data.question || '',
        data.selectedOption || ''
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy as Web App

1. **Deploy** → **New deployment** par click karein
2. **Select type**: **Web app** choose karein
3. **Description**: "Quiz Data Webhook" type karein
4. **Execute as**: **Me** select karein
5. **Who has access**: **Anyone** select karein
6. **Deploy** button par click karein
7. **Authorize access** karein (pehli baar)
8. **Web app URL** copy karein

### Step 4: Config.js Mein URL Add Karein

`config.js` file kholen aur webhook URL add karein:

```javascript
window.webhookConfig = {
    endpoint1: '',  // Email webhook (optional)
    endpoint2: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',  // Google Sheets URL
    enabled: true  // true karein
};
```

## Testing

1. Quiz complete karein
2. Google Sheet check karein
3. Data automatically add hoga

## Data Example

Jab quiz complete hoga, aapko sheet mein yeh dikhega:

| Timestamp | Event | Name | Phone | Email | Age | Gender | Status | Q1 | Q2 | Q3 | Q4 | Q5 |
|-----------|-------|------|-------|-------|-----|--------|--------|----|----|----|----|----|
| 2024-01-15T10:30:00Z | quiz_completed | John Doe | +1234567890 | john@example.com | 30 | male | Completed | Work opportunities | Canada | Bachelor's | 4-7 years | Advanced |

## Troubleshooting

### Data nahi aa raha?
- Check karein ki `enabled: true` hai config.js mein
- Browser console (F12) mein errors check karein
- Google Apps Script execution logs check karein

### Permission error?
- Apps Script mein "Anyone" access set karein
- Web app URL sahi hai ya nahi check karein

### Data format galat?
- Apps Script code check karein
- Headers sheet mein sahi order mein hain ya nahi verify karein

## Real-time Updates

Agar aap chahte hain ki har question answer hone par data save ho, to Apps Script mein `question_answered` event handle karein. Yeh optional hai - main data quiz complete hone par hi save hoga.




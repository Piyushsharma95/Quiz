# Google Sheets Setup - Complete Guide

## Quick Setup Steps

### Step 1: Google Apps Script Code

1. [Google Sheets](https://sheets.google.com) par jayein
2. New spreadsheet banayein
3. **Extensions** → **Apps Script** par click karein
4. Purana code delete karein aur yeh code paste karein:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var timestamp = new Date();
  var result = {};
  try {
    // Verify we received a JSON payload
    if (!e.postData || !e.postData.contents) {
      throw new Error("No POST data received");
    }
    
    // Parse the posted JSON
    var data = JSON.parse(e.postData.contents);

    // Basic input sanitation (flatten nested objects to strings)
    var row = [timestamp];
    var headers = Object.keys(data);
    // You can set headers explicitly if required for consistency
    headers.forEach(function (key) {
      var value = data[key];
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      // Basic data cleaning: remove line breaks, trim whitespace
      if (typeof value === "string") {
        value = value.replace(/[\r\n]+/g, " ").trim();
      }
      row.push(value);
    });

    // If sheet is empty, write headers first for clarity
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp"].concat(headers));
    }
    sheet.appendRow(row);

    result.status = "success";
    result.message = "Row added";
  } catch (error) {
    result.status = "error";
    result.message = error.message;
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
```

### Step 2: Deploy as Web App

1. **Deploy** → **New deployment** par click karein
2. **Select type**: **Web app** choose karein
3. **Description**: "Quiz Data Webhook" type karein
4. **Execute as**: **Me** select karein
5. **Who has access**: **Anyone** select karein (IMPORTANT!)
6. **Deploy** button par click karein
7. Pehli baar **Authorize access** karein
8. **Web app URL** copy karein (yeh aapka webhook URL hai)

### Step 3: Config.js Mein URL Add Karein

`config.js` file kholen aur webhook URL add karein:

```javascript
window.webhookConfig = {
    endpoint1: '',  // Email webhook (optional)
    endpoint2: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',  // Yahan paste karein
    enabled: true  // true karein
};
```

**Example:**
```javascript
window.webhookConfig = {
    endpoint1: '',
    endpoint2: 'https://script.google.com/macros/s/AKfycby.../exec',
    enabled: true
};
```

## Data Format

Jab quiz complete hoga, yeh data Google Sheets mein jayega:

### Columns (Automatic):
- **Timestamp** (automatically added by script)
- **name** - User ka naam
- **phone** - Phone number
- **email** - Email address
- **age** - Age
- **gender** - Gender
- **status** - Completed ya Partial
- **totalQuestions** - Total questions (5)
- **answeredQuestions** - Kitne answer kiye
- **question1** - Pehle question ka text
- **answer1** - Pehle question ka answer
- **question2** - Doosre question ka text
- **answer2** - Doosre question ka answer
- **question3** - Teesre question ka text
- **answer3** - Teesre question ka answer
- **question4** - Chauth question ka text
- **answer4** - Chauth question ka answer
- **question5** - Paanchve question ka text
- **answer5** - Paanchve question ka answer
- **submissionTime** - Submission ka time
- **quizStartTime** - Quiz start ka time

## Testing

1. Browser console (F12) kholen
2. Quiz complete karein
3. Console mein yeh dikhega:
   - `📤 Sending to Google Sheets`
   - `✅ Data saved to sheet!`
4. Google Sheet check karein - data add hoga

## Troubleshooting

### Data nahi aa raha?

1. **Check config.js:**
   - `enabled: true` hai?
   - `endpoint2` URL sahi hai?

2. **Check Browser Console (F12):**
   - Koi errors dikh rahe hain?
   - Webhook call ho raha hai?

3. **Check Google Apps Script:**
   - Script properly deployed hai?
   - "Anyone" access set hai?
   - Execution logs check karein (View → Logs)

4. **Check Webhook URL:**
   - URL sahi format mein hai?
   - `/exec` end mein hai?

### Common Errors:

**Error: "No POST data received"**
- Webhook URL galat hai
- Request properly nahi ja raha

**Error: "HTTP error! status: 405"**
- Method POST allowed nahi hai
- Web app properly deployed nahi hai

**Error: CORS error**
- "Anyone" access set karein
- Web app URL sahi hai ya nahi check karein

## Example Data Row

| Timestamp | name | phone | email | age | gender | status | question1 | answer1 | ... |
|-----------|------|-------|-------|-----|--------|--------|-----------|---------|-----|
| 2024-01-15 10:30:00 | John Doe | +1234567890 | john@example.com | 30 | male | Completed | What is your primary reason... | Work and career opportunities | ... |

## Important Notes

1. **Pehli baar** quiz complete karne par headers automatically create honge
2. **Har entry** ek nayi row mein add hogi
3. **Real-time** - Data immediately sheet mein save hoga
4. **All data** - Name, phone, email, age, gender, aur sab answers save honge

## Support

Agar data nahi aa raha:
1. Browser console check karein (F12)
2. Google Apps Script execution logs check karein
3. Webhook URL verify karein
4. Config.js mein `enabled: true` hai ya nahi check karein




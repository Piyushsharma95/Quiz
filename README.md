# Immigration Quiz Landing Page

A beautiful immigration assessment landing page with an interactive quiz feature that generates and emails PDF results.

## Features

- **Landing Page**: Modern, responsive landing page with "Start Now" button
- **User Form**: Collects name, age, and gender before starting the quiz
- **Interactive Quiz**: 5 immigration-related questions
- **30-Second Timer**: Each question has a 30-second countdown timer
- **Auto-Advance**: Questions automatically advance when answered or time expires
- **PDF Generation**: Automatically generates a professional PDF of quiz results
- **Email Integration**: Sends quiz results PDF to configured email address
- **One-Time Restriction**: Users with same name, age, and gender can only take quiz once

## Quick Start

1. Open `index.html` in a web browser
2. Click "Start Now" button
3. Fill out the form (name, age, gender)
4. Complete the quiz
5. PDF will be generated and sent to email (if configured)

## Email Setup (Required for PDF Delivery)

The recipient email is configured as: **piyushdigital.arogyam@gmail.com**

To enable automatic PDF email delivery:

1. Go to [EmailJS](https://www.emailjs.com/) and create a free account

2. Add an Email Service:
   - Go to "Email Services" in your dashboard
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Copy your Service ID

3. Create an Email Template:
   - Go to "Email Templates" in your dashboard
   - Click "Create New Template"
   - **CRITICAL: Set "To Email" field correctly:**
     * **Option 1 (Recommended):** Use the variable `{{to_email}}`
     * **Option 2:** Hardcode the email directly: `piyushdigital.arogyam@gmail.com`
   - Set "Subject" field to: `{{subject}}`
   - In the email body, include:
     ```
     Hello,
     
     Quiz results for {{user_name}} (Age: {{user_age}}, Gender: {{user_gender}})
     
     {{quiz_results}}
     
     PDF attachment: The PDF is generated and will be sent as an attachment if your email service supports it.
     PDF Link: {{pdf_link}}
     ```
   - Save the template and copy the Template ID
   - **Troubleshooting "email not found" error:**
     * Make sure the "To Email" field is set to either `{{to_email}}` OR `piyushdigital.arogyam@gmail.com`
     * The email MUST match exactly: `piyushdigital.arogyam@gmail.com`
     * Check browser console for detailed error messages

4. Get your Public Key:
   - Go to "Account" -> "General" in your dashboard
   - Copy your Public Key

5. Update `config.js`:
   - Set `enabled` to `true`
   - Add your Service ID
   - Add your Template ID
   - Add your Public Key
   - Recipient email is already set to: piyushdigital.arogyam@gmail.com

6. Save and refresh your page!

**Note**: EmailJS free tier may have limitations on attachments. For PDF attachments, you may need to:
- Use EmailJS REST API with attachments
- Or include the PDF as a downloadable link in the email body
- Or use a backend service to handle PDF email delivery

## Files

- `index.html` - Main HTML file
- `styles.css` - Styling and layout
- `script.js` - Quiz logic, PDF generation, and email functionality
- `config.js` - Email configuration

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge).

## PDF Generation

The quiz automatically generates a professional PDF containing:
- User information (name, age, gender)
- All quiz questions and answers
- Formatted with proper styling and page numbers

PDF is generated using jsPDF library and:
- Automatically emailed to **piyushdigital.arogyam@gmail.com** (if EmailJS is configured)
- **NOT** downloaded to user's PC
- **NOT** sent to the quiz taker's email
- Results are sent **ONLY** to the configured administrator email

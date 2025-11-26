// Email Configuration
// To enable email functionality, set up EmailJS (https://www.emailjs.com/)
// and fill in the values below:

window.emailConfig = {
  enabled: false,  // ⚠️ SET TO true AFTER configuring EmailJS below
  serviceId: '',   // 📧 Paste your EmailJS Service ID here (e.g., 'service_abc123')
  templateId: '',  // 📝 Paste your EmailJS Template ID here (e.g., 'template_xyz789')
  publicKey: '',   // 🔑 Paste your EmailJS Public Key here (e.g., 'abcdefghijklmnop')
  recipientEmail: 'piyushdigital.arogyam@gmail.com' // ✅ Already set correctly
};

// Webhook Configuration
// Endpoint 1: Send email on quiz completion (full quiz submission)
// Endpoint 2: Real-time submission to Google Sheets (partial and complete submissions)
window.webhookConfig = {
  endpoint1: 'https://webhook.site/46ce312d-1116-404d-979a-62943632b1fa',  // 🔗 Webhook URL for email service (quiz completion only)
  endpoint2: 'https://script.google.com/macros/s/AKfycbzxDI9ejzv08GVHaCXO_m-QGzs_yd86knp-1YM7tUNOMVdu1mtFX9i9e3UQpcQLuhg-/exec',  // 🔗 Webhook URL for Google Sheets
  enabled: true  // ✅ Enabled
};

/*
EXAMPLE - After setup, your config.js should look like this:

window.emailConfig = {
    enabled: true,  // Changed from false to true
    serviceId: 'service_abc123',  // Your actual Service ID from EmailJS
    templateId: 'template_xyz789', // Your actual Template ID from EmailJS
    publicKey: 'abcdefghijklmnop', // Your actual Public Key from EmailJS
    recipientEmail: 'piyushdigital.arogyam@gmail.com'
};
*/

/* 
SETUP INSTRUCTIONS:

1. Go to https://www.emailjs.com/ and create a free account

2. Add an Email Service:
   - Go to "Email Services" in your dashboard
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions

3. Create an Email Template:
   - Go to "Email Templates" in your dashboard
   - Click "Create New Template"
   - IMPORTANT: Set "To Email" field to ONE of these options:
     * Option 1: Use the variable: {{to_email}}
     * Option 2: Hardcode the email: piyushdigital.arogyam@gmail.com
   - Set "Subject" field to: {{subject}}
   - In the email body, use these template variables:
     - {{to_email}} - recipient email (piyushdigital.arogyam@gmail.com)
     - {{subject}} - email subject
     - {{message}} - email body content
     - {{user_name}} - user's name
     - {{user_age}} - user's age
     - {{user_gender}} - user's gender
     - {{quiz_results}} - full quiz results
   - Note: PDF attachment will be sent automatically via EmailJS API
   - Save the template and copy the Template ID

4. Get your Public Key:
   - Go to "Account" -> "General" in your dashboard
   - Copy your Public Key

5. Update this file:
   - Set enabled to true
   - Add your Service ID (from step 2)
   - Add your Template ID (from step 3)
   - Add your Public Key (from step 4)
   - Add your recipient email address

6. Save and refresh your page!
*/

/* 
WEBHOOK SETUP INSTRUCTIONS:

Endpoint 1 (Email Service):
- This webhook is called ONLY when the quiz is fully completed
- Used to send email notifications
- Add your webhook URL here (e.g., 'https://your-email-service.com/webhook')

Endpoint 2 (Google Sheets):
- This webhook is called in REAL-TIME:
  * Every time a question is answered
  * When quiz completes (full submission)
  * When user exits (partial submission)
- Used to store submission data in Google Sheets
- Add your Google Sheets webhook URL here (e.g., 'https://script.google.com/macros/s/.../exec')

EXAMPLE - After setup, your webhookConfig should look like this:

window.webhookConfig = {
    endpoint1: 'https://your-email-service.com/webhook',  // Email webhook
    endpoint2: 'https://script.google.com/macros/s/ABC123/exec',  // Google Sheets webhook
    enabled: true  // Changed from false to true
};
*/


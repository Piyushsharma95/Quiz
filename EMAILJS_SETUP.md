# EmailJS Setup Guide - Step by Step

This guide will help you set up EmailJS to automatically send quiz results PDFs to **piyushdigital.arogyam@gmail.com**.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (it's free)
3. Create an account using your email or Google account
4. Verify your email address

## Step 2: Add Email Service

1. After logging in, go to **"Email Services"** in the left sidebar
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended if using Gmail)
   - **Outlook** (if using Outlook/Hotmail)
   - Or choose **SMTP** for other providers
4. Follow the setup instructions:
   - For **Gmail**: You'll need to enable 2-factor authentication and create an app password
   - For **SMTP**: Enter your SMTP server details
5. After setup, you'll see a **Service ID** (e.g., `service_abc123`)
   - **COPY THIS** - you'll need it in config.js

## Step 3: Create Email Template

1. Go to **"Email Templates"** in the left sidebar
2. Click **"Create New Template"**
3. Configure the template:

   **Important - "To Email" field:**
   - You can use either:
     - `{{to_email}}` (uses the variable)
     - OR directly type: `piyushdigital.arogyam@gmail.com`
   - **I recommend Option 2** - directly type: `piyushdigital.arogyam@gmail.com`

   **Subject field:**
   - Type: `{{subject}}`

   **Email body:**
   ```
   Hello,

   New quiz results received!

   User Information:
   Name: {{user_name}}
   Age: {{user_age}}
   Gender: {{user_gender}}

   Quiz Results:
   {{quiz_results}}

   The PDF is attached or available at: {{pdf_link}}

   Best regards,
   Immigration Quiz System
   ```

4. Click **"Save"**
5. Copy the **Template ID** (e.g., `template_xyz789`)
   - **COPY THIS** - you'll need it in config.js

## Step 4: Get Public Key

1. Go to **"Account"** → **"General"** in the left sidebar
2. Find **"Public Key"** (also called API Key)
   - It looks like: `abcdefghijklmnop`
3. **COPY THIS** - you'll need it in config.js

## Step 5: Update config.js

Open `config.js` and update it with your EmailJS credentials:

```javascript
window.emailConfig = {
    enabled: true,  // Change from false to true
    serviceId: 'service_abc123',   // Paste your Service ID from Step 2
    templateId: 'template_xyz789',  // Paste your Template ID from Step 3
    publicKey: 'abcdefghijklmnop',   // Paste your Public Key from Step 4
    recipientEmail: 'piyushdigital.arogyam@gmail.com' // Already set correctly
};
```

## Step 6: Test It!

1. Save the `config.js` file
2. Refresh your browser
3. Take the quiz
4. Complete it
5. Check your email at **piyushdigital.arogyam@gmail.com** for the quiz results PDF

## Troubleshooting

### "Email not found" error:
- Make sure the "To Email" field in your EmailJS template is set to: `piyushdigital.arogyam@gmail.com`
- Check that `enabled: true` in config.js

### "Service not found" error:
- Check that your Service ID is correct in config.js
- Make sure your email service is active in EmailJS dashboard

### "Template not found" error:
- Check that your Template ID is correct in config.js
- Make sure your template is saved in EmailJS dashboard

### Email not being sent:
- Check browser console (F12) for error messages
- Verify all three IDs (Service ID, Template ID, Public Key) are correct
- Make sure `enabled: true` in config.js

## Need Help?

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: Check their support page on the website

---

**Remember**: After updating config.js, always **save the file** and **refresh your browser** for changes to take effect!


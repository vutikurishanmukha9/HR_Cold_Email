<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# StreamMail: Cold Email Outreach Platform

A powerful, user-friendly platform for managing cold email outreach campaigns with personalization, scheduling, and batch sending capabilities.

## Features

✨ **Personalized Emails** - Use dynamic placeholders like `{fullName}`, `{companyName}`, and `{jobTitle}` to personalize each email

📊 **Bulk Upload** - Import recipients from Excel files (.xlsx, .xls) with automatic duplicate detection

✍️ **Rich Text Editor** - Compose professional emails with formatting, lists, and links

📎 **Attachments** - Add files up to 10MB per attachment

⏰ **Scheduling** - Schedule campaigns for future sending

🔄 **Batch Sending** - Configure batch size and delays to avoid spam filters

📈 **Real-time Progress** - Track sending status with live progress updates and estimated time remaining

🔒 **Secure** - Uses Gmail App Passwords, credentials never stored

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Gmail App Password:**
   - Create a Google App Password by following [this guide](https://support.google.com/accounts/answer/185833)
   - Set the `GEMINI_API_KEY` in [.env.local](.env.local) (optional, for AI features)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## How to Use

### Step 1: Connect Gmail Account
- Enter your Gmail address
- Provide your 16-character Google App Password
- Spaces in the password are automatically removed

### Step 2: Upload Recipients
- Prepare an Excel file with columns: "Full name", "Email address", "Company", and optionally "Job Title"
- Drag and drop or select your file (max 5MB)
- Review the parsed recipients (duplicates are automatically removed)

### Step 3: Compose Email
- Write your subject line (max 200 characters)
- Compose your email body using the rich text editor
- Use personalization tags from the sidebar
- Add attachments if needed (max 10MB each)

### Step 4: Review & Send
- Review your campaign summary
- Select recipients to include
- Configure batch size and delay between batches
- Choose to send immediately or schedule for later
- Monitor real-time progress with status updates

## Troubleshooting

### Email Sending Fails
- Verify your Google App Password is correct (16 characters)
- Ensure "Less secure app access" is enabled in your Google account
- Check that SMTP.js library loaded successfully (refresh the page)
- Disable browser ad-blockers that might block SMTP.js

### File Upload Issues
- Ensure file is .xlsx or .xls format
- Check file size is under 5MB
- Verify columns match expected names (case-insensitive)

### Scheduling Not Working
- Ensure scheduled time is in the future
- Check browser allows JavaScript timers
- Don't close the browser tab before scheduled time

## Technical Stack

- **Frontend:** React 19 with TypeScript
- **Styling:** Tailwind CSS
- **Email Sending:** SMTP.js
- **File Parsing:** SheetJS (xlsx)
- **Build Tool:** Vite

## Security Notes

- Credentials are only used during the active session
- No data is stored on any server
- All processing happens in your browser
- Use Google App Passwords, never your actual Gmail password

## License

This project is private and for demonstration purposes.

---

View your app in AI Studio: https://ai.studio/apps/temp/1

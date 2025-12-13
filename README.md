# HiHR - Smart HR Email Outreach

A modern, enterprise-grade platform for managing cold email outreach campaigns with personalization, scheduling, and batch sending capabilities. Built with React, TypeScript, and Node.js.

---

## Overview

HiHR streamlines HR recruitment and outreach workflows by enabling professionals to send personalized bulk emails efficiently. The platform features a premium dark-themed interface with glassmorphism design elements.

## Key Features

### Email Campaign Management
- **Personalized Emails** - Dynamic placeholders (`{fullName}`, `{companyName}`, `{jobTitle}`) for tailored messaging
- **Rich Text Editor** - Compose professional emails with formatting, lists, and hyperlinks
- **Attachments** - Support for files up to 10MB per attachment
- **Scheduling** - Schedule campaigns for future delivery
- **Batch Sending** - Configurable batch size and delays to optimize deliverability

### Data Management
- **Bulk Upload** - Import recipients from Excel files (.xlsx, .xls)
- **Duplicate Detection** - Automatic identification and removal of duplicate emails
- **Recipient Selection** - Choose specific recipients before sending

### Monitoring
- **Real-time Progress** - Live status updates during campaign execution
- **Campaign Results** - Detailed sent/failed statistics after completion
- **Estimated Time** - Remaining time calculations for active campaigns

### Security
- **Encrypted Credentials** - AES-256 encryption for stored credentials
- **JWT Authentication** - Secure user sessions with access and refresh tokens
- **Account Lockout** - 5 failed login attempts = 30 minute lockout
- **Password Strength Meter** - Real-time visual feedback during registration
- **Rate Limiting** - Protection against abuse with per-route rate limits
- **CORS/CSP Headers** - Configured security headers
- **Error Boundary** - Graceful error handling for React components

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Vite | Build Tool |
| SheetJS (xlsx) | Excel Parsing |
| Zod | Validation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | API Framework |
| TypeScript | Type Safety |
| Prisma | ORM |
| SQLite | Database (Dev) |
| PostgreSQL | Database (Prod) |
| Nodemailer | Email Sending |
| Winston | Logging |
| Helmet | Security Headers |

---

## Architecture Highlights

### Performance Optimizations
- **Email Connection Pooling** - SMTP connections are cached and reused (5-10x faster)
- **API Retry with Exponential Backoff** - Auto-retry on network failures (3 retries, 1s/2s/4s delays)
- **Request Timeout** - 30s default, 5min for campaign sends
- **Batch Email Processing** - Configurable batch size and delays

### Code Organization
- **Pages Pattern** - AuthPage and DashboardPage for clear separation
- **Custom Hooks** - `useCampaign` extracts complex state logic
- **Service Layer** - Business logic separated from controllers
- **Request Logging** - Unique request IDs for tracing

### API Client Features
- Automatic retry on 5xx errors
- Request/response timeout handling
- Token refresh on 401 errors
- Structured error extraction

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vutikurishanmukha9/HR_Cold_Email.git
   cd HR_Cold_Email
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**
   
   Create `backend/.env`:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database (SQLite for development)
   DATABASE_URL="file:./dev.db"

   # JWT Secrets (use strong random strings in production)
   JWT_SECRET=your-jwt-secret-key-min-32-characters
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars

   # Encryption Key (MUST be exactly 32 characters)
   ENCRYPTION_KEY=your-32-character-encryption-key

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

5. **Initialize the database**
   ```bash
   cd backend
   npx prisma db push
   ```

6. **Start the development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the application**
   
   Navigate to `http://localhost:3000`

---

## Usage Guide

### Step 1: Authentication
- Register a new account or login with existing credentials
- User sessions are managed via JWT tokens

### Step 2: Connect Gmail Account
- Enter your Gmail address
- Provide your 16-character Google App Password (no spaces)
- Credentials are encrypted and stored securely

> For information on creating a Google App Password, visit the [Google Help Center](https://support.google.com/accounts/answer/185833)

### Step 3: Upload Recipients
- Prepare an Excel file with columns:
  - `Full name` or `Name`
  - `Email address` or `Email`
  - `Company` or `Organization`
  - `Job title` (optional)
- Drag and drop or select your file (max 5MB)
- Review the parsed recipients

### Step 4: Compose Email
- Write your subject line (max 200 characters)
- Use the rich text editor for email body
- Insert personalization tags from the sidebar
- Add attachments if needed

### Step 5: Review and Send
- Review campaign summary
- Select recipients to include
- Configure batch size and delay settings
- Send immediately or schedule for later
- Monitor real-time progress

---

## Project Structure

```
HR_Cold_Email/
├── README.md
├── LICENSE
├── .gitignore
├── frontend/                   # React Frontend
│   ├── App.tsx                 # Main app (routing only, ~30 lines)
│   ├── index.html              # Entry HTML
│   ├── index.css               # Global styles (dark theme)
│   ├── index.tsx               # React entry point
│   ├── types.ts                # TypeScript types
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── package.json            # Frontend dependencies
│   ├── pages/                  # Page components
│   │   ├── AuthPage.tsx        # Login/Register page
│   │   └── DashboardPage.tsx   # Main campaign workflow
│   ├── hooks/                  # Custom React hooks
│   │   ├── useCampaign.ts      # Campaign state management
│   │   └── useScript.tsx       # Script loading hook
│   ├── components/             # Reusable UI components
│   │   ├── CredentialsForm.tsx
│   │   ├── RecipientUploader.tsx
│   │   ├── EmailComposer.tsx
│   │   ├── ReviewAndSend.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── PasswordStrengthMeter.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api.ts              # Enhanced API client with retry
│   └── public/
│       └── favicon.svg
└── backend/                    # Node.js Backend
    ├── src/
    │   ├── server.ts           # Express app setup
    │   ├── routes/             # API route definitions
    │   ├── controllers/        # Request handlers
    │   ├── middleware/         # Auth, validation, logging, etc.
    │   │   ├── auth.ts         # JWT authentication
    │   │   ├── rateLimit.ts    # Rate limiting
    │   │   ├── security.ts     # CORS, Helmet headers
    │   │   ├── validation.ts   # Zod schema validation
    │   │   ├── errorHandler.ts # Global error handling
    │   │   └── requestLogger.ts # Request ID & logging
    │   ├── services/           # Business logic
    │   │   ├── auth.service.ts # Account lockout, login
    │   │   ├── email.service.ts # Connection pooling
    │   │   ├── campaign.service.ts
    │   │   └── credential.service.ts
    │   └── utils/
    │       ├── logger.ts       # Winston structured logging
    │       ├── encryption.ts   # AES-256 encryption
    │       ├── jwt.ts          # Token management
    │       └── validation.ts   # Zod schemas
    ├── prisma/
    │   └── schema.prisma
    └── package.json            # Backend dependencies
```


---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Credentials
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/credentials` | Save email credentials |
| GET | `/api/credentials` | List user credentials |
| DELETE | `/api/credentials/:id` | Delete credential |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns/send` | Send email campaign |

---

## Troubleshooting

### Email Sending Fails
- Verify your Google App Password is correct (16 characters, no spaces)
- Ensure 2-Factor Authentication is enabled on your Google account
- Check that the recipient email addresses are valid
- Check backend console for detailed SMTP error messages

### Decryption Error ("bad decrypt")
- The ENCRYPTION_KEY in .env may have changed since credentials were saved
- Solution: Reset the database and re-add your credentials
  ```bash
  cd backend
  npx prisma db push --force-reset
  ```

### File Upload Issues
- Ensure file is .xlsx or .xls format
- Check file size is under 5MB
- Verify column names match expected patterns

### Authentication Issues
- Clear browser cookies and local storage
- Check that the backend server is running on port 5000
- Verify environment variables are set correctly

---

## Security Considerations

- Credentials are encrypted using AES-256-CBC before storage
- Passwords are hashed using bcrypt with salt rounds
- JWT tokens expire after 15 minutes (access) / 7 days (refresh)
- **Account Lockout**: 5 failed login attempts triggers 30-minute lockout
- **Password Strength Meter**: Visual feedback encourages strong passwords
- Rate limiting prevents brute force attacks
- Input validation using Zod schemas on both frontend and backend
- Helmet middleware for security headers
- CORS configured for specific frontend origin

---

## Production Deployment

For production deployment, refer to [`backend/docs/POSTGRESQL_MIGRATION.md`](backend/docs/POSTGRESQL_MIGRATION.md) for database migration instructions.

Key considerations:
- Use PostgreSQL instead of SQLite
- Set `NODE_ENV=production`
- Use strong, random secrets for JWT and encryption
- Configure proper CORS origins
- Enable HTTPS

---

## License

This project is private and for demonstration purposes.

---

## Author

V Shanmukha

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

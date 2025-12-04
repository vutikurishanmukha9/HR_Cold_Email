import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import StepIndicator from './components/StepIndicator';
import CredentialsForm from './components/CredentialsForm';
import RecipientUploader from './components/RecipientUploader';
import EmailComposer from './components/EmailComposer';
import ReviewAndSend from './components/ReviewAndSend';
import { Credentials, Recipient, EmailTemplate, EmailStatus, SendProgressState } from './types';
import apiClient from './services/api';

// Login/Register Component - Premium Design
const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md fade-in">
        <div className="glass-card p-8 md:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text' }}>
              HiHR
            </h1>
            <p className="text-gray-400">Smart HR Email Outreach</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 mb-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${isLogin
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${!isLogin
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="slide-up">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-2">
                  Min 8 characters with uppercase, lowercase & number
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Please wait...
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <p className="text-sm text-cyan-300 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Your Gmail credentials are encrypted and stored securely on our servers.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: '',
    body: '',
    attachments: [],
  });

  // State for ReviewAndSend component
  const [sendProgress, setSendProgress] = useState<Record<string, import('./types').SendProgressState>>({});
  const [isSending, setIsSending] = useState(false);
  const [isCampaignFinished, setIsCampaignFinished] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);

  const totalSteps = 4;

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleCredentialsSave = async (creds: Credentials) => {
    try {
      // Save credentials to backend (encrypted)
      await apiClient.saveCredential(creds.email, creds.appPassword, true);
      setCredentials(creds);
      setStep(2);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save credentials';

      // Handle specific error cases with user-friendly messages
      if (errorMessage.toLowerCase().includes('already exists')) {
        // Credential already saved - this is actually okay, proceed to next step
        setCredentials(creds);
        setStep(2);
        return;
      }

      // For other errors, show appropriate message
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        alert('Unable to connect to the server. Please make sure the backend is running.');
      } else if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('401')) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert(`Error: ${errorMessage}`);
      }
      console.error('Credential save error:', error);
    }
  };

  const handleRecipientsUpload = (uploadedRecipients: Recipient[]) => {
    setRecipients(uploadedRecipients);
    setStep(3);
  };

  const handleEmailCompose = (template: EmailTemplate) => {
    setEmailTemplate(template);
    setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Premium Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  HiHR
                </h1>
                <p className="text-gray-400 text-sm">Smart HR Email Outreach</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Logged in as</p>
                <p className="font-medium text-white">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#a0aec0' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        {/* Main Content */}
        <div className="glass-card p-8 mt-6">
          {step === 1 && (
            <CredentialsForm
              onSave={handleCredentialsSave}
              initialCredentials={credentials}
            />
          )}

          {step === 2 && (
            <RecipientUploader
              onUpload={handleRecipientsUpload}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <EmailComposer
              onCompose={handleEmailCompose}
              onBack={handleBack}
              recipients={recipients}
              initialTemplate={emailTemplate}
            />
          )}

          {step === 4 && credentials && (
            <ReviewAndSend
              credentials={credentials}
              recipients={recipients}
              emailTemplate={emailTemplate}
              sendProgress={sendProgress}
              isSending={isSending}
              isCampaignFinished={isCampaignFinished}
              scheduledTime={scheduledTime}
              onScheduleOrSend={async (config) => {
                // Handle scheduling
                if (config.time) {
                  setScheduledTime(config.time);
                  return;
                }

                // Handle sending via backend
                setIsSending(true);

                // Initialize progress for all recipients
                const initialProgress: Record<string, SendProgressState> = {};
                config.recipientsToSend.forEach(r => {
                  initialProgress[r.email] = { status: EmailStatus.Queued };
                });
                setSendProgress(initialProgress);

                try {
                  // Mark all as sending
                  config.recipientsToSend.forEach(r => {
                    setSendProgress(prev => ({
                      ...prev,
                      [r.email]: { status: EmailStatus.Sending }
                    }));
                  });

                  // Call backend API
                  const result = await apiClient.sendCampaign({
                    credentialEmail: credentials.email,
                    subject: emailTemplate.subject,
                    body: emailTemplate.body,
                    recipients: config.recipientsToSend,
                    batchSize: config.batchSize,
                    batchDelay: config.batchDelay,
                  });

                  // Update progress based on results
                  result.results.forEach(r => {
                    setSendProgress(prev => ({
                      ...prev,
                      [r.email]: {
                        status: r.status === 'sent'
                          ? EmailStatus.Sent
                          : EmailStatus.Failed,
                        error: r.error,
                      }
                    }));
                  });

                  setIsCampaignFinished(true);
                } catch (error: any) {
                  console.error('Campaign send error:', error);
                  // Mark all as failed
                  config.recipientsToSend.forEach(r => {
                    setSendProgress(prev => ({
                      ...prev,
                      [r.email]: {
                        status: EmailStatus.Failed,
                        error: error.message || 'Campaign failed'
                      }
                    }));
                  });
                  setIsCampaignFinished(true);
                } finally {
                  setIsSending(false);
                }
              }}
              onCancelSchedule={() => setScheduledTime(null)}
              onBack={handleBack}
              onReset={() => {
                setStep(1);
                setCredentials(null);
                setRecipients([]);
                setEmailTemplate({ subject: '', body: '', attachments: [] });
                setSendProgress({});
                setIsSending(false);
                setIsCampaignFinished(false);
                setScheduledTime(null);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>
            Powered by StreamMail | Your credentials are encrypted and secure
          </p>
          <p className="mt-1">
            Backend: <span className="text-green-600">●</span> Connected
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

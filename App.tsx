import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import StepIndicator from './components/StepIndicator';
import CredentialsForm from './components/CredentialsForm';
import RecipientUploader from './components/RecipientUploader';
import EmailComposer from './components/EmailComposer';
import ReviewAndSend from './components/ReviewAndSend';
import { Credentials, Recipient, EmailTemplate } from './types';
import apiClient from './services/api';

// Login/Register Component
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          StreamMail
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Cold Email Outreach Platform
        </p>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${isLogin
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${!isLogin
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={8}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters, include uppercase, lowercase, and number
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After logging in, you'll enter your Gmail credentials for sending emails. These are encrypted and stored securely.
          </p>
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
      // Show user-friendly error
      const errorMessage = error.message || 'Failed to save credentials';
      alert(`Error: ${errorMessage}\n\nPlease make sure:\n1. Backend server is running\n2. You're logged in\n3. Gmail credentials are correct`);
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">StreamMail</h1>
              <p className="text-gray-600">Cold Email Outreach Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold text-gray-800">{user?.email}</p>
              <button
                onClick={logout}
                className="text-sm text-indigo-600 hover:text-indigo-800 mt-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-6">
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
              onBack={handleBack}
              onSendComplete={() => { }}
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

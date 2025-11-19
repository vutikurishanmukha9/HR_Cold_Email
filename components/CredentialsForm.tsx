
import React, { useState } from 'react';
import { Credentials } from '../types';

interface CredentialsFormProps {
    onSave: (credentials: Credentials) => void;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({ onSave }) => {
    const [email, setEmail] = useState('');
    const [appPassword, setAppPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Improved email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.trim() || !emailRegex.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        // Remove spaces from app password for validation
        const cleanPassword = appPassword.replace(/\s/g, '');
        if (cleanPassword.length !== 16) {
            setError('Google App Password must be exactly 16 characters (spaces are ignored).');
            return;
        }

        setError('');
        onSave({ email: email.trim(), appPassword: cleanPassword });
    };

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Step 1: Connect Your Gmail Account</h2>
            <p className="text-center text-gray-500 mt-2">Enter your sender email and a Google App Password to send emails securely.</p>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <span className="font-bold">Security Notice:</span> Your credentials are used only for sending emails during this session and are not stored. For information on creating an App Password, visit the{' '}
                            <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-yellow-800">
                                Google Help Center
                            </a>.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Sender Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="appPassword" className="block text-sm font-medium text-gray-700">Google App Password</label>
                    <div className="mt-1 relative">
                        <input
                            id="appPassword"
                            type={showPassword ? "text" : "password"}
                            value={appPassword}
                            onChange={(e) => setAppPassword(e.target.value)}
                            placeholder="•••• •••• •••• ••••"
                            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                            aria-describedby="password-help"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p id="password-help" className="mt-1 text-xs text-gray-500">16 characters, spaces will be removed</p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={!email || !appPassword}
                    >
                        Save & Continue
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CredentialsForm;

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import useCampaign from '../hooks/useCampaign';
import StepIndicator from '../components/StepIndicator';
import CredentialsForm from '../components/CredentialsForm';
import RecipientUploader from '../components/RecipientUploader';
import EmailComposer from '../components/EmailComposer';
import ReviewAndSend from '../components/ReviewAndSend';

/**
 * DashboardPage Component - Main Campaign Workflow
 * Uses useCampaign hook for state management
 */
const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const campaign = useCampaign();

    const handleCredentialsSave = async (creds: { email: string; appPassword: string }) => {
        const result = await campaign.handleCredentialsSave(creds);
        if (!result.success && result.error) {
            // Handle specific error cases
            if (result.error.toLowerCase().includes('network') || result.error.toLowerCase().includes('fetch')) {
                alert('Unable to connect to the server. Please make sure the backend is running on port 5000.');
            } else if (result.error.toLowerCase().includes('unauthorized') || result.error.toLowerCase().includes('401')) {
                alert('Your session has expired. Please log in again.');
            } else {
                alert('Error: ' + result.error);
            }
        }
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
                <StepIndicator currentStep={campaign.step} totalSteps={campaign.totalSteps} />

                {/* Main Content */}
                <div className="glass-card p-8 mt-6">
                    {campaign.step === 1 && (
                        <CredentialsForm
                            onSave={handleCredentialsSave}
                            initialCredentials={campaign.credentials}
                        />
                    )}

                    {campaign.step === 2 && (
                        <RecipientUploader
                            onUpload={campaign.handleRecipientsUpload}
                            onBack={campaign.handleBack}
                        />
                    )}

                    {campaign.step === 3 && (
                        <EmailComposer
                            onCompose={campaign.handleEmailCompose}
                            onBack={campaign.handleBack}
                            recipients={campaign.recipients}
                            initialTemplate={campaign.emailTemplate}
                        />
                    )}

                    {campaign.step === 4 && campaign.credentials && (
                        <ReviewAndSend
                            credentials={campaign.credentials}
                            recipients={campaign.recipients}
                            emailTemplate={campaign.emailTemplate}
                            sendProgress={campaign.sendProgress}
                            isSending={campaign.isSending}
                            isCampaignFinished={campaign.isCampaignFinished}
                            scheduledTime={campaign.scheduledTime}
                            onScheduleOrSend={campaign.handleSendCampaign}
                            onCancelSchedule={campaign.handleCancelSchedule}
                            onBack={campaign.handleBack}
                            onReset={campaign.handleReset}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600 text-sm">
                    <p>
                        Powered by HiHR | Your credentials are encrypted and secure
                    </p>
                    <p className="mt-1">
                        Backend: <span className="text-green-600">●</span> Connected
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

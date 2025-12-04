import React, { useState, useEffect } from 'react';
import { Credentials, Recipient, EmailTemplate, EmailStatus, SendProgressState } from '../types';

interface ReviewAndSendProps {
    credentials: Credentials | null;
    recipients: Recipient[];
    emailTemplate: EmailTemplate;
    sendProgress: Record<string, SendProgressState>;
    isSending: boolean;
    isCampaignFinished: boolean;
    scheduledTime: Date | null;
    onScheduleOrSend: (config: { time: Date | null, batchSize: number, batchDelay: number, recipientsToSend: Recipient[] }) => void;
    onCancelSchedule: () => void;
    onBack: () => void;
    onReset: () => void;
}

const StatusIndicator: React.FC<{ progress: SendProgressState }> = ({ progress }) => {
    if (!progress) return null;
    const { status, error } = progress;

    switch (status) {
        case EmailStatus.Queued:
            return <span className="flex items-center text-xs font-medium text-gray-500"><svg className="w-2.5 h-2.5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>Queued</span>;
        case EmailStatus.Sending:
            return <span className="flex items-center text-xs font-medium text-blue-500"><svg className="animate-spin h-3 w-3 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</span>;
        case EmailStatus.Sent:
            return <span className="flex items-center text-xs font-medium text-green-500"><svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>Sent</span>;
        case EmailStatus.Failed:
            return (
                <span title={error || 'An unknown error occurred'} className="flex items-center text-xs font-medium text-red-500 cursor-help">
                    <svg className="w-3 h-3 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    Failed
                </span>
            );
        default:
            return null;
    }
};

const ReviewAndSend: React.FC<ReviewAndSendProps> = ({
    credentials,
    recipients,
    emailTemplate,
    sendProgress,
    isSending,
    isCampaignFinished,
    scheduledTime,
    onScheduleOrSend,
    onCancelSchedule,
    onBack,
    onReset
}) => {
    const [selectedEmails, setSelectedEmails] = useState<string[]>(() => recipients.map(r => r.email));
    const [campaignRecipients, setCampaignRecipients] = useState<Recipient[] | null>(null);

    useEffect(() => {
        setSelectedEmails(recipients.map(r => r.email));
        setCampaignRecipients(null);
    }, [recipients]);

    const recipientsForCampaign = recipients.filter(r => selectedEmails.includes(r.email));
    const displayList = campaignRecipients || recipients;

    const isReady = credentials && recipients.length > 0 && emailTemplate.subject && emailTemplate.body;

    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDateTime, setScheduleDateTime] = useState('');
    const [scheduleError, setScheduleError] = useState('');
    const [batchSize, setBatchSize] = useState(10);
    const [batchDelay, setBatchDelay] = useState(60);

    const sentCount = Object.values(sendProgress).filter(s => s.status === EmailStatus.Sent).length;
    const failedCount = Object.values(sendProgress).filter(s => s.status === EmailStatus.Failed).length;
    const campaignSize = campaignRecipients?.length ?? recipientsForCampaign.length;
    const progressPercentage = campaignSize > 0 ? ((sentCount + failedCount) / campaignSize) * 100 : 0;

    // Calculate estimated time remaining
    const getEstimatedTimeRemaining = () => {
        if (!isSending || campaignSize === 0) return null;
        const processed = sentCount + failedCount;
        if (processed === 0) return null;

        const emailsRemaining = campaignSize - processed;
        const batchesRemaining = Math.ceil(emailsRemaining / batchSize);
        const estimatedSeconds = (batchesRemaining * batchDelay) + (emailsRemaining * 0.3); // 0.3s per email stagger

        if (estimatedSeconds < 60) return `${Math.round(estimatedSeconds)}s`;
        if (estimatedSeconds < 3600) return `${Math.round(estimatedSeconds / 60)}m`;
        return `${Math.round(estimatedSeconds / 3600)}h ${Math.round((estimatedSeconds % 3600) / 60)}m`;
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // Schedule for at least 1 minute in the future
        return now.toISOString().slice(0, 16);
    };

    const handleActionClick = () => {
        const config = {
            time: null as Date | null,
            batchSize: Math.max(1, batchSize),
            batchDelay: Math.max(0, batchDelay),
            recipientsToSend: recipientsForCampaign,
        };

        if (isScheduling) {
            if (!scheduleDateTime) {
                setScheduleError('Please select a date and time to schedule.');
                return;
            }
            const scheduleDate = new Date(scheduleDateTime);
            if (scheduleDate.getTime() <= Date.now()) {
                setScheduleError('Please select a time in the future.');
                return;
            }
            setScheduleError('');
            config.time = scheduleDate;
        } else {
            setScheduleError('');
        }
        setCampaignRecipients(recipientsForCampaign);
        onScheduleOrSend(config);
    };

    const handleRecipientSelect = (email: string) => {
        setSelectedEmails(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEmails(recipients.map(r => r.email));
        } else {
            setSelectedEmails([]);
        }
    };

    const getButtonText = () => {
        if (isSending) return 'Sending...';
        if (isScheduling) return 'Schedule Campaign';
        return `Send ${recipientsForCampaign.length} Emails`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Step 4: Review and Send Campaign</h2>
            <p className="text-center text-gray-500 mt-2">
                {isCampaignFinished ? 'Your campaign is complete.' : (scheduledTime ? 'Your campaign is scheduled.' : 'Final check before launching your outreach.')}
            </p>

            {isReady ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Campaign Summary</h3>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-4">
                            <p className="text-sm"><strong className="font-medium text-gray-900">Sender:</strong> <span className="text-gray-600">{credentials?.email}</span></p>
                            <p className="text-sm"><strong className="font-medium text-gray-900">Recipients:</strong> <span className="text-gray-600">{recipientsForCampaign.length} selected</span></p>
                            <p className="text-sm"><strong className="font-medium text-gray-900">Subject:</strong> <span className="text-gray-600">{emailTemplate.subject}</span></p>
                            {emailTemplate.attachments && emailTemplate.attachments.length > 0 && (
                                <div>
                                    <strong className="text-sm font-medium text-gray-900">Attachments:</strong>
                                    <ul className="text-sm text-gray-600 space-y-1 mt-1">
                                        {emailTemplate.attachments.map((file, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                </svg>
                                                <span>{file.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <strong className="text-sm font-medium text-gray-900">Email Body Preview:</strong>
                                <div
                                    className="mt-2 p-3 border border-gray-200 rounded-md bg-white text-sm text-gray-700 max-h-48 overflow-y-auto prose prose-sm"
                                    dangerouslySetInnerHTML={{ __html: emailTemplate.body }}
                                />
                            </div>
                        </div>

                        {isCampaignFinished ? (
                            <div className="mt-8">
                                <h4 className="text-md font-semibold text-gray-800">Campaign Results</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{sentCount}</p>
                                        <p className="text-sm font-medium text-green-800">Sent</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                                        <p className="text-sm font-medium text-red-800">Failed</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onReset}
                                        className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Start New Campaign
                                    </button>
                                </div>
                            </div>
                        ) : scheduledTime && !isSending ? (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 text-center">
                                    Campaign is scheduled for: <br />
                                    <strong className="font-semibold">{scheduledTime.toLocaleString()}</strong>
                                </p>
                                <div className="mt-4 flex justify-center space-x-4">
                                    <button onClick={() => onScheduleOrSend({ time: null, batchSize, batchDelay, recipientsToSend: recipientsForCampaign })} className="py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Send Now Instead</button>
                                    <button onClick={onCancelSchedule} className="py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel Schedule</button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                                    <h4 className="text-md font-medium text-gray-800">Sending Configuration</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="batch-size" className="block text-sm font-medium text-gray-700">Batch Size</label>
                                            <input type="number" id="batch-size" value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 1)} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSending} />
                                        </div>
                                        <div>
                                            <label htmlFor="batch-delay" className="block text-sm font-medium text-gray-700">Delay Between Batches (sec)</label>
                                            <input type="number" id="batch-delay" value={batchDelay} onChange={(e) => setBatchDelay(parseInt(e.target.value, 10) || 0)} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSending} />
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="schedule-toggle" type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked={isScheduling} onChange={(e) => setIsScheduling(e.target.checked)} disabled={isSending} />
                                        <label htmlFor="schedule-toggle" className="ml-2 block text-sm text-gray-900">Schedule for later</label>
                                    </div>
                                    {isScheduling && (
                                        <div className="mt-2">
                                            <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700">Schedule Time</label>
                                            <input type="datetime-local" id="schedule-time" value={scheduleDateTime} onChange={(e) => setScheduleDateTime(e.target.value)} min={getMinDateTime()} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSending} />
                                        </div>
                                    )}
                                </div>

                                {scheduleError && <p className="text-sm text-red-600 mt-2">{scheduleError}</p>}

                                <div className="mt-6 flex justify-between">
                                    <button type="button" onClick={onBack} disabled={isSending} className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                        Back
                                    </button>
                                    <button type="button" onClick={handleActionClick} disabled={isSending || (isScheduling && !scheduleDateTime) || recipientsForCampaign.length === 0} className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {getButtonText()}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Recipients & Progress</h3>
                        {(isSending || isCampaignFinished) && (
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-600">{sentCount + failedCount} / {campaignSize} processed</p>
                                    {isSending && getEstimatedTimeRemaining() && (
                                        <p className="text-sm text-gray-500">Est. {getEstimatedTimeRemaining()} remaining</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="mt-4 border border-gray-200 rounded-lg bg-white">
                            {!isSending && !isCampaignFinished && (
                                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="select-all"
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            checked={recipients.length > 0 && selectedEmails.length === recipients.length}
                                            onChange={handleSelectAll}
                                            disabled={isSending || isCampaignFinished}
                                        />
                                        <label htmlFor="select-all" className="ml-2 block text-sm font-medium text-gray-700">Select All</label>
                                    </div>
                                    <span className="text-sm text-gray-500">{selectedEmails.length} / {recipients.length} selected</span>
                                </div>
                            )}
                            <ul className="divide-y divide-gray-200 overflow-auto max-h-80">
                                {displayList.map((recipient) => (
                                    <li key={recipient.email} className="px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            {!isSending && !isCampaignFinished && (
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    checked={selectedEmails.includes(recipient.email)}
                                                    onChange={() => handleRecipientSelect(recipient.email)}
                                                />
                                            )}
                                            <div className={`text-sm ${isSending || isCampaignFinished ? '' : 'ml-3'}`}>
                                                <p className="font-medium text-gray-900">{recipient.fullName}</p>
                                                <p className="text-gray-500">{recipient.email}</p>
                                            </div>
                                        </div>
                                        {(isSending || isCampaignFinished) && <StatusIndicator progress={sendProgress[recipient.email] || { status: EmailStatus.Queued }} />}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Something is missing. Please go back and complete all previous steps.</p>
                    <button type="button" onClick={onBack} className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Go Back</button>
                </div>
            )}
        </div>
    );
};

export default ReviewAndSend;

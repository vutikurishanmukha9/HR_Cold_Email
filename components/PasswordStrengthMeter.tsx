import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
    password: string;
}

interface StrengthResult {
    score: number;
    label: string;
    color: string;
    feedback: string[];
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    const strength: StrengthResult = useMemo(() => {
        if (!password) {
            return { score: 0, label: '', color: 'transparent', feedback: [] };
        }

        let score = 0;
        const feedback: string[] = [];

        // Length checks
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('At least 8 characters');
        }

        if (password.length >= 12) {
            score += 1;
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add uppercase letter');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add lowercase letter');
        }

        // Number check
        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add a number');
        }

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add special character');
        }

        // Determine label and color
        let label: string;
        let color: string;

        if (score <= 2) {
            label = 'Weak';
            color = '#ef4444'; // red
        } else if (score <= 4) {
            label = 'Medium';
            color = '#f59e0b'; // amber
        } else {
            label = 'Strong';
            color = '#22c55e'; // green
        }

        return { score, label, color, feedback };
    }, [password]);

    if (!password) {
        return null;
    }

    const percentage = (strength.score / 6) * 100;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${percentage}%`,
                            background: strength.color
                        }}
                    />
                </div>
                <span
                    className="text-xs font-medium min-w-[50px]"
                    style={{ color: strength.color }}
                >
                    {strength.label}
                </span>
            </div>

            {/* Feedback */}
            {strength.feedback.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {strength.feedback.slice(0, 3).map((tip, index) => (
                        <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.5)'
                            }}
                        >
                            {tip}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;

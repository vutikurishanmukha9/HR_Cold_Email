
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: 'Connect Gmail', icon: '📧' },
  { number: 2, title: 'Upload Recipients', icon: '📋' },
  { number: 3, title: 'Compose Email', icon: '✏️' },
  { number: 4, title: 'Review & Send', icon: '🚀' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                  transition-all duration-500 relative
                  ${currentStep > step.number
                    ? 'text-white shadow-lg'
                    : currentStep === step.number
                      ? 'text-white shadow-lg'
                      : 'text-gray-500'
                  }
                `}
                style={{
                  background: currentStep > step.number
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : currentStep === step.number
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255,255,255,0.05)',
                  border: currentStep >= step.number ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: currentStep === step.number ? '0 0 30px rgba(102, 126, 234, 0.5)' : 'none',
                }}
              >
                {currentStep > step.number ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}

                {/* Pulse animation for current step */}
                {currentStep === step.number && (
                  <div className="absolute inset-0 rounded-xl animate-ping opacity-20"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  />
                )}
              </div>

              {/* Step Title */}
              <span
                className={`
                  mt-3 text-xs font-medium text-center transition-colors duration-300
                  ${currentStep >= step.number ? 'text-white' : 'text-gray-500'}
                `}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: currentStep > step.number ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #10b981 0%, #667eea 100%)',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;

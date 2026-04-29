import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    gradient?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    subtitle, 
    icon,
    gradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)'
}) => {
    return (
        <div className="glass-card p-5 relative overflow-hidden group">
            {/* Subtle background glow effect on hover */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"
                style={{ background: gradient }}
            />
            
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                        {title}
                    </p>
                    <h3 className="text-3xl font-extrabold mt-2 mb-1" style={{ color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs" style={{ color: '#64748b' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                
                <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                    style={{ background: gradient }}
                >
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;

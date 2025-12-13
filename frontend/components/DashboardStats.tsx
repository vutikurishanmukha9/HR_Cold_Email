import React from 'react';

interface DashboardStatsProps {
    totalSent: number;
    successRate: number;
    todaySent: number;
    pendingCount: number;
}

/**
 * Dashboard Stats Component
 * Shows email campaign statistics with animated counters
 */
const DashboardStats: React.FC<DashboardStatsProps> = ({
    totalSent,
    successRate,
    todaySent,
    pendingCount,
}) => {
    const stats = [
        {
            label: 'Total Sent',
            value: totalSent,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            ),
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
            label: 'Success Rate',
            value: `${successRate}%`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-green-500 to-emerald-600',
            bgColor: 'rgba(16, 185, 129, 0.1)',
        },
        {
            label: 'Today',
            value: todaySent,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: 'from-purple-500 to-violet-600',
            bgColor: 'rgba(139, 92, 246, 0.1)',
        },
        {
            label: 'Pending',
            value: pendingCount,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-amber-500 to-orange-600',
            bgColor: 'rgba(245, 158, 11, 0.1)',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={stat.label}
                    className="glass-card p-4 hover:scale-105 transition-transform duration-300"
                    style={{
                        background: stat.bgColor,
                        animationDelay: `${index * 100}ms`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;

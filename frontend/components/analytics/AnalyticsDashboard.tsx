import React from 'react';
import useAnalytics from '../../hooks/useAnalytics';
import StatCard from './StatCard';
import TrackingTable from './TrackingTable';
import EmptyState from '../EmptyState';

const AnalyticsDashboard: React.FC = () => {
    const { 
        stats, 
        details, 
        pagination, 
        isLoading, 
        error, 
        selectedCampaign, 
        availableCampaigns,
        refresh, 
        setPage, 
        setSelectedCampaign 
    } = useAnalytics({ autoRefreshInterval: 60000 }); // 60s auto refresh

    // If initial load and no data at all
    if (!isLoading && details.length === 0 && !selectedCampaign && (!stats || stats.totalSent === 0)) {
        return <EmptyState type="analytics" />;
    }

    return (
        <div className="space-y-6 step-enter">
            
            {/* Header Area with Filters & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl" style={{ border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Campaign Analytics</h2>
                        <p className="text-xs text-gray-400">Live tracking for opens and clicks</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Campaign Filter */}
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full bg-black/40 text-sm text-gray-300 rounded-lg px-4 py-2 appearance-none outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            style={{ border: '1px solid rgba(148, 163, 184, 0.2)' }}
                        >
                            <option value="">All Campaigns</option>
                            {availableCampaigns.map(camp => (
                                <option key={camp} value={camp}>
                                    {camp.substring(0, 30)}{camp.length > 30 ? '...' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button 
                        onClick={refresh}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        title="Refresh Analytics"
                    >
                        <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Total Sent"
                        value={stats.totalSent}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                        gradient="linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)"
                    />
                    <StatCard 
                        title="Total Opened"
                        value={stats.totalOpened}
                        subtitle={`${stats.openRate}% Open Rate`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>}
                        gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                    />
                    <StatCard 
                        title="Open Rate"
                        value={`${stats.openRate}%`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>}
                        gradient="linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)"
                    />
                    <StatCard 
                        title="Total Clicks"
                        value={stats.totalClicks}
                        subtitle={`${stats.uniqueClicks} unique`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>}
                        gradient="linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)"
                    />
                </div>
            )}

            {/* Tracking Details Table */}
            <TrackingTable 
                details={details} 
                pagination={pagination}
                isLoading={isLoading && details.length === 0} 
                onPageChange={setPage}
            />
        </div>
    );
};

export default AnalyticsDashboard;

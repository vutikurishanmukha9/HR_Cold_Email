import React from 'react';
import { TrackingDetail, PaginationMeta } from '../../types';

interface TrackingTableProps {
    details: TrackingDetail[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    onPageChange: (page: number) => void;
}

const TrackingTable: React.FC<TrackingTableProps> = ({ details, pagination, isLoading, onPageChange }) => {
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(date);
    };

    if (isLoading) {
        return (
            <div className="glass-card p-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent" style={{ borderTopColor: '#6366f1' }}></div>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase border-b" style={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)' }}>Recipient</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase border-b" style={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)' }}>Campaign</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase border-b" style={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)' }}>Status</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase border-b" style={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)' }}>Activity</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase border-b text-right" style={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)' }}>Last Open</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(148, 163, 184, 0.05)' }}>
                        {details.map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{row.recipientEmail}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-300 truncate max-w-[200px]" title={row.subject || row.campaignId}>
                                        {row.subject || row.campaignId || 'Unknown'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {row.opened ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                                            Opened
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                                            Unread
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-4 text-sm">
                                        <div className="flex items-center gap-1" title="Opens">
                                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            <span className={row.openCount > 0 ? 'text-white' : 'text-gray-500'}>{row.openCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Link Clicks">
                                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                                            <span className={row.clicks > 0 ? 'text-white' : 'text-gray-500'}>{row.clicks}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm" style={{ color: '#cbd5e1' }}>
                                    {formatDate(row.lastOpenedAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                    <div className="text-sm text-gray-400">
                        Showing <span className="font-medium text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-white">{pagination.total}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1 text-sm rounded-lg border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ borderColor: 'rgba(148, 163, 184, 0.2)', color: '#f1f5f9' }}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1 text-sm rounded-lg border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ borderColor: 'rgba(148, 163, 184, 0.2)', color: '#f1f5f9' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackingTable;

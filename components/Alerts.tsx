import React, { useState, useMemo } from 'react';
import type { AlertEntry } from '../types';
import { ShieldCheckIcon } from './icons/Icons';

const generateMockIp = () => `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

const SEVERITIES: AlertEntry['severity'][] = ['Critical', 'High', 'Medium', 'Low', 'Info'];
const PROTOCOLS: AlertEntry['protocol'][] = ['TCP', 'UDP', 'ICMP'];

const generateMockAlerts = (count: number): AlertEntry[] => {
    return Array.from({ length: count }, (_, i) => {
        const isIntrusion = Math.random() < 0.3;
        const status = isIntrusion ? 'Intrusion' : 'Normal';
        let severity: AlertEntry['severity'];
        if (isIntrusion) {
            severity = SEVERITIES[Math.floor(Math.random() * 3)]; // Critical, High, Medium
        } else {
            severity = Math.random() < 0.1 ? 'Low' : 'Info'; // Mostly Info, some Low
        }
        return {
            id: Date.now() + i,
            timestamp: new Date(Date.now() - i * 300000).toLocaleString(),
            status,
            severity,
            sourceIp: generateMockIp(),
            destIp: generateMockIp(),
            protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
        };
    });
};

const SEVERITY_STYLES: Record<AlertEntry['severity'], string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Info: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const STATUS_STYLES: Record<AlertEntry['status'], string> = {
    Intrusion: 'text-danger',
    Normal: 'text-success',
};

const ALERTS_PER_PAGE = 10;

const Alerts: React.FC = () => {
    const [alerts] = useState<AlertEntry[]>(() => generateMockAlerts(100));
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Intrusion' | 'Normal'>('All');

    const filteredAlerts = useMemo(() => {
        return alerts
            .filter(alert => statusFilter === 'All' || alert.status === statusFilter)
            .filter(alert => alert.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [alerts, statusFilter, searchTerm]);

    const paginatedAlerts = useMemo(() => {
        const startIndex = (currentPage - 1) * ALERTS_PER_PAGE;
        return filteredAlerts.slice(startIndex, startIndex + ALERTS_PER_PAGE);
    }, [filteredAlerts, currentPage]);

    const totalPages = Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <ShieldCheckIcon className="w-8 h-8 text-primary" />
                    Security Alerts
                </h1>
                <div className="flex items-center gap-2 bg-base-200 border border-base-300 p-1 rounded-lg">
                    {(['All', 'Intrusion', 'Normal'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                statusFilter === status ? 'bg-primary text-white' : 'hover:bg-base-100/50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-base-200 border border-base-300 p-4 rounded-lg shadow-lg">
                 <input
                    type="text"
                    placeholder="Search by source IP..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-base-100 border border-base-300 rounded-md px-4 py-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none"
                />
            </div>

            <div className="bg-base-200 border border-base-300 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-base-100/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Severity</th>
                                <th scope="col" className="px-6 py-3">Source IP</th>
                                <th scope="col" className="px-6 py-3">Destination IP</th>
                                <th scope="col" className="px-6 py-3">Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAlerts.map((alert) => (
                                <tr key={alert.id} className="border-b border-base-300 hover:bg-base-100/30">
                                    <td className="px-6 py-4">{alert.timestamp}</td>
                                    <td className={`px-6 py-4 font-bold ${STATUS_STYLES[alert.status]}`}>{alert.status}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${SEVERITY_STYLES[alert.severity]}`}>
                                            {alert.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{alert.sourceIp}</td>
                                    <td className="px-6 py-4 font-mono">{alert.destIp}</td>
                                    <td className="px-6 py-4">{alert.protocol}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {paginatedAlerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No alerts match your criteria.
                    </div>
                 )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-between items-center text-sm">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-base-200 border border-base-300 rounded-lg hover:bg-base-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-base-200 border border-base-300 rounded-lg hover:bg-base-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Alerts;

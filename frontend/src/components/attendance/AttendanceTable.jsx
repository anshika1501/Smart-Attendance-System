import React, { useMemo, useState } from 'react';

const Badge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
        {status ? 'Present' : 'Absent'}
    </span>
);

const AttendanceTable = ({ records = [], pageSize = 8 }) => {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(records.length / pageSize));

    const pageData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return records.slice(start, start + pageSize);
    }, [page, pageSize, records]);

    return (
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h3 className="text-sm text-slate-300 mb-3">Attendance Records</h3>

            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="text-left text-xs text-slate-400 border-b border-slate-700/40">
                            <th className="py-2">Date</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Time</th>
                            <th className="py-2">Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((r, i) => (
                            <tr key={i} className="text-sm text-slate-200 border-b border-slate-700/10">
                                <td className="py-3">{r.date}</td>
                                <td className="py-3"><Badge status={r.status} /></td>
                                <td className="py-3">{r.time || '-'}</td>
                                <td className="py-3">{r.location || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-400">Showing {pageData.length} of {records.length}</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-slate-700 text-slate-200 text-sm" disabled={page === 1}>Prev</button>
                    <div className="text-sm text-slate-300">{page} / {totalPages}</div>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded bg-slate-700 text-slate-200 text-sm" disabled={page === totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTable;

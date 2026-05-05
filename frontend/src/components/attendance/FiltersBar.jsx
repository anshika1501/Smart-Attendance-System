import React from 'react';
import { RefreshCw } from 'lucide-react';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const FiltersBar = ({ monthIndex, onMonthChange, subject, subjects = [], onSubjectChange, onRefresh }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs text-slate-400 mr-2">Month</label>
                <select value={monthIndex} onChange={(e) => onMonthChange(Number(e.target.value))} className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded">
                    {months.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs text-slate-400 mr-2">Subject</label>
                <select value={subject || ''} onChange={(e) => onSubjectChange(e.target.value)} className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded">
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="ml-auto">
                <button onClick={onRefresh} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded flex items-center gap-2">
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default FiltersBar;

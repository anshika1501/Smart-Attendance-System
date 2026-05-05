import React from 'react';

const SummaryCards = ({ stats = [] }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {stats.map((s, idx) => (
                <div
                    key={idx}
                    className={`p-4 rounded-2xl flex items-center gap-4 border ${s.border || 'border-transparent'}`}
                    style={{ background: s.bg || 'rgba(255,255,255,0.03)' }}
                >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-white/5 shrink-0">
                        {s.icon}
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-slate-400">{s.title}</p>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        {s.subtext && <p className="text-xs text-slate-400 mt-1">{s.subtext}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;

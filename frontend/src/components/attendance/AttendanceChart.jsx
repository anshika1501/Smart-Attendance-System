import React, { useRef, useState } from 'react';

const AttendanceChart = ({ data = [] }) => {
    const containerRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);

    const handleEnter = (e, d) => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            day: d.day,
            status: d.status,
        });
    };

    return (
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-3">Daily Attendance</h3>

            <div ref={containerRef} className="w-full h-44 flex items-end gap-1 relative">
                {data.map((d, i) => {
                    const color = d.status ? 'bg-emerald-400' : 'bg-red-500';
                    const heightPct = d.status ? 100 : 8;
                    return (
                        <div key={i} className="flex-1 flex items-end">
                            <div
                                onMouseEnter={(e) => handleEnter(e, d)}
                                onMouseMove={(e) => handleEnter(e, d)}
                                onMouseLeave={() => setTooltip(null)}
                                className={`${color} rounded-t-md w-full transition-all duration-150 hover:opacity-90 cursor-pointer`}
                                style={{ height: `${heightPct}%` }}
                            />
                        </div>
                    );
                })}

                {tooltip && (
                    <div
                        className="absolute z-50 p-2 text-xs bg-slate-900/95 text-white rounded-md shadow-lg -translate-y-2"
                        style={{ left: tooltip.x, top: tooltip.y - 36, transform: 'translateX(-50%)' }}
                    >
                        <div className="font-medium">Day {tooltip.day}</div>
                        <div className="text-slate-300">{tooltip.status ? 'Present' : 'Absent'}</div>
                    </div>
                )}
            </div>

            <div className="mt-3 text-xs text-slate-400 flex justify-between px-1">
                <span>1</span>
                <span>{data.length}</span>
            </div>
        </div>
    );
};

export default AttendanceChart;

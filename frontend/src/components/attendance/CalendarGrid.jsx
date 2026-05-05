import React from 'react';

const CalendarGrid = ({ year, month, days = [] }) => {
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month, 0).getDate();

    const blanks = Array.from({ length: firstDay }).map((_, idx) => (
        <div key={`b${idx}`} />
    ));

    const dayCells = Array.from({ length: daysInMonth }).map((_, idx) => {
        const day = idx + 1;
        const dayData = days.find((d) => d.day === day) || { status: 0 };
        const color = dayData.status ? 'bg-emerald-500' : 'bg-red-500';
        const isToday =
            new Date().getDate() === day && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

        return (
            <div key={day} className={`p-2 rounded-lg flex items-center justify-center ${isToday ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-medium`}>{day}</div>
                </div>
            </div>
        );
    });

    return (
        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-slate-300">Calendar</h4>
                <div className="text-xs text-slate-500">Legend: <span className="ml-2 inline-block w-3 h-3 rounded-full bg-emerald-400 mr-1" />Present <span className="ml-2 inline-block w-3 h-3 rounded-full bg-red-500 mr-1 ml-2" />Absent</div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {blanks}
                {dayCells}
            </div>
        </div>
    );
};

export default CalendarGrid;

import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Percent,
  Clock3,
  MapPin,
  Flame,
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
} from 'lucide-react';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function generateMockData(year, monthIndex) {
  const days = daysInMonth(year, monthIndex);
  const data = [];

  for (let day = 1; day <= days; day += 1) {
    const present = Math.random() > 0.18;
    const hour = 8 + Math.floor(Math.random() * 3);
    const minute = Math.random() > 0.5 ? '30' : '00';

    data.push({
      date: new Date(year, monthIndex, day).toISOString().slice(0, 10),
      day,
      status: present ? 'present' : 'absent',
      time: present ? `${hour}:${minute}` : null,
      location: present ? `Room ${1 + Math.floor(Math.random() * 6)}` : null,
    });
  }

  return data;
}

function CircleProgress({ value, size = 82, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <svg width={size} height={size} className="block">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="transparent" stroke="#334155" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="transparent"
          stroke={value >= 75 ? '#22c55e' : '#eab308'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90)"
        />
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central" className="fill-slate-100 text-sm font-bold">
          {value}%
        </text>
      </g>
    </svg>
  );
}

function AttendanceChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="relative">
      {hovered && (
        <div
          className="absolute z-20 -top-14 -translate-x-1/2 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 shadow-lg shadow-black/30"
          style={{ left: `${((hoveredIndex + 0.5) / data.length) * 100}%` }}
        >
          <p className="font-semibold">{hovered.date}</p>
          <p className={hovered.status === 'present' ? 'text-green-400' : 'text-red-400'}>
            {hovered.status === 'present' ? 'Present' : 'Absent'}
          </p>
        </div>
      )}

      <div className="h-56 rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <div className="flex h-full items-end gap-1.5">
          {data.map((item, index) => {
            const present = item.status === 'present';
            const barHeight = present ? '82%' : '28%';

            return (
              <button
                key={item.date}
                type="button"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                className="group flex h-full flex-1 items-end outline-none"
                aria-label={`${item.date} ${item.status}`}
              >
                <div
                  style={{ height: barHeight }}
                  className={`w-full rounded-md transition-all duration-200 ${
                    present ? 'bg-green-500/80 group-hover:bg-green-400' : 'bg-red-500/80 group-hover:bg-red-400'
                  } ${hoveredIndex === index ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between px-1 pt-4 text-[11px] text-slate-400">
        <span>1</span>
        <span>{Math.ceil(data.length / 2)}</span>
        <span>{data.length}</span>
      </div>
    </div>
  );
}

function AttendanceCalendar({ data, year, monthIndex, selectedDate, onSelectDate }) {
  const days = daysInMonth(year, monthIndex);
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, monthIndex, day).toISOString().slice(0, 10);
    const entry = data.find((item) => item.date === date);
    cells.push({ day, entry, date });
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-7 gap-3 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-16 rounded-xl" />;
          }

          const isSelected = selectedDate === cell.date;
          const status = cell.entry?.status;

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`h-16 rounded-xl border p-3 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-400 bg-slate-600/90 shadow-md shadow-blue-500/20'
                  : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">{cell.day}</span>
                {status && (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      status === 'present' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AttendanceMonitor() {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [subject, setSubject] = useState('All Subjects');
  const [data, setData] = useState(() => generateMockData(now.getFullYear(), now.getMonth()));
  const [selectedDate, setSelectedDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10));
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const refreshed = generateMockData(year, monthIndex);
    setData(refreshed);
    setSelectedDate(refreshed[0]?.date || '');
    setPage(1);
  }, [year, monthIndex]);

  const stats = useMemo(() => {
    const total = data.length;
    const present = data.filter((item) => item.status === 'present').length;
    const absent = total - present;
    const percentage = total ? Math.round((present / total) * 100) : 0;

    let streak = 0;
    for (let i = data.length - 1; i >= 0; i -= 1) {
      if (data[i].status === 'present') streak += 1;
      else break;
    }

    return { total, present, absent, percentage, streak };
  }, [data]);

  const selectedEntry = useMemo(
    () => data.find((item) => item.date === selectedDate) || null,
    [data, selectedDate]
  );

  const pageCount = Math.ceil(data.length / pageSize);
  const pageData = data.slice().reverse().slice((page - 1) * pageSize, page * pageSize);

  function refresh() {
    const refreshed = generateMockData(year, monthIndex);
    setData(refreshed);
    setPage(1);
  }

  const summaryCards = [
    {
      title: 'Total Classes',
      value: stats.total,
      icon: <BookOpenCheck className="text-sky-400" size={22} />,
      accent: 'border-sky-500/30',
    },
    {
      title: 'Present Days',
      value: stats.present,
      icon: <CheckCircle2 className="text-green-400" size={22} />,
      accent: 'border-green-500/30',
    },
    {
      title: 'Absent Days',
      value: stats.absent,
      icon: <XCircle className="text-red-400" size={22} />,
      accent: 'border-red-500/30',
    },
    {
      title: 'Attendance',
      value: `${stats.percentage}%`,
      icon: <Percent className="text-yellow-400" size={22} />,
      accent: 'border-yellow-500/30',
    },
  ];

  return (
    <div className="bg-slate-900 p-6 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Attendance Monitor</h1>
          <p className="text-sm text-slate-400">Professional monthly attendance overview and daily insights.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={monthIndex}
            onChange={(e) => setMonthIndex(Number(e.target.value))}
            className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-200 focus:border-blue-400"
          >
            {MONTHS.map((month, index) => (
              <option value={index} key={month}>
                {month} {year}
              </option>
            ))}
          </select>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-200 focus:border-blue-400"
          >
            <option>All Subjects</option>
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Computer Science</option>
          </select>

          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:bg-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`h-full rounded-2xl border ${card.accent} bg-slate-800 p-5 shadow-lg shadow-black/20 transition hover:scale-[1.02]`}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div className="rounded-lg bg-slate-700/60 p-2">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.percentage < 75 && (
        <div className="my-6 flex items-center gap-3 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5 text-yellow-300">
          <AlertTriangle size={18} />
          <p className="text-sm">
            Attendance warning: monthly percentage is <span className="font-semibold">{stats.percentage}%</span> (below 75%).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="mb-6 rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                <BarChart3 size={16} />
                Daily Trend
              </h2>
              <span className="text-xs text-slate-400">
                {MONTHS[monthIndex]} {year}
              </span>
            </div>
            <AttendanceChart data={data} />
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                <CalendarDays size={16} />
                Monthly Calendar
              </h2>
              <span className="text-xs text-slate-400">Click a day to inspect record</span>
            </div>

            <AttendanceCalendar
              data={data}
              year={year}
              monthIndex={monthIndex}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {selectedEntry && (
              <div className="mt-4 rounded-xl border border-slate-600 bg-slate-900/60 p-3 text-sm text-slate-300">
                <div className="space-y-4">
                  <p className="font-semibold text-slate-100">{selectedEntry.date}</p>
                  <p>
                    Status:{' '}
                    <span className={selectedEntry.status === 'present' ? 'text-green-400' : 'text-red-400'}>
                      {selectedEntry.status === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex h-full flex-col gap-6 lg:col-span-1">
          <section className="rounded-2xl border border-orange-400/30 bg-slate-800 p-5 shadow-lg shadow-black/20">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Current Streak</p>
                <p className="flex items-center gap-2 text-2xl font-bold text-orange-300">
                  <Flame size={24} />
                  {stats.streak}-day streak
                </p>
                <p className="text-xs text-slate-400">Keep this streak to boost your monthly attendance percentage.</p>
              </div>
              <CircleProgress value={stats.percentage} />
            </div>
          </section>

          <section className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Attendance Records</h3>

              <div className="overflow-hidden rounded-xl border border-slate-700">
                <table className="w-full border-separate border-spacing-y-3 px-2 text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((record) => (
                      <tr key={record.date} className="bg-slate-700/40 transition-all duration-200 hover:bg-slate-700/80">
                        <td className="rounded-l-lg px-4 py-3 text-left text-slate-200">{record.date}</td>
                        <td className="px-4 py-3 text-left">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              record.status === 'present' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={13} />
                            {record.time || '-'}
                          </span>
                        </td>
                        <td className="rounded-r-lg px-4 py-3 text-left text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} />
                            {record.location || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Page {page} of {pageCount || 1}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 transition-all duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(pageCount || 1, prev + 1))}
                    disabled={page === pageCount || pageCount === 0}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 transition-all duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

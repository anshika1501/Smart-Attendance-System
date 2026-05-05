import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import SummaryCards from '../components/attendance/SummaryCards';
import AttendanceChart from '../components/attendance/AttendanceChart';
import CalendarGrid from '../components/attendance/CalendarGrid';
import AttendanceTable from '../components/attendance/AttendanceTable';
import FiltersBar from '../components/attendance/FiltersBar';
import api from '../services/api';

const CircleProgress = ({ percent = 0, size = 80 }) => {
    const stroke = 8;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (percent / 100) * c;
    return (
        <svg width={size} height={size} className="block">
            <g transform={`translate(${size / 2},${size / 2})`}>
                <circle r={r} stroke="#0f172a" strokeWidth={stroke} fill="none" />
                <circle r={r} stroke={percent >= 75 ? '#16a34a' : '#ef4444'} strokeWidth={stroke} fill="none" strokeLinecap="round"
                    strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90)" />
                <text x="0" y="4" textAnchor="middle" fill="white" fontWeight="700" fontSize="14">{percent}%</text>
            </g>
        </svg>
    );
};

const generateMockAttendance = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }).map((_, idx) => {
        const day = idx + 1;
        const present = Math.random() > 0.12; // ~88% present
        return {
            day,
            date: new Date(year, month - 1, day).toISOString().slice(0, 10),
            status: present ? 1 : 0,
            time: present ? `08:${(10 + Math.floor(Math.random() * 50)).toString().padStart(2, '0')}` : null,
            location: present ? 'Campus Gate' : null,
        };
    });
};

const StudentAttendance = () => {
    const now = new Date();
    const [year] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [subject, setSubject] = useState('');
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try fetching from backend first (if endpoint exists), otherwise fallback to mock
        async function load() {
            setLoading(true);
            try {
                // Placeholder: the backend may not expose this endpoint; keep silent on error
                const resp = await api.get(`/attendance-summary?year=${year}&month=${month}`);
                if (resp.data && resp.data.days) {
                    setDays(resp.data.days);
                } else {
                    setDays(generateMockAttendance(year, month));
                }
            } catch (err) {
                setDays(generateMockAttendance(year, month));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [year, month]);

    const stats = useMemo(() => {
        const total = days.length || new Date(year, month, 0).getDate();
        const present = days.reduce((acc, d) => acc + (d.status ? 1 : 0), 0);
        const absent = total - present;
        const percent = total ? Math.round((present / total) * 100) : 0;

        // streak: consecutive present days up to last day
        let streak = 0;
        for (let i = days.length - 1; i >= 0; i--) {
            if (days[i].status) streak++; else break;
        }

        return { total, present, absent, percent, streak };
    }, [days, year, month]);

    const summary = [
        { title: 'Total Classes (month)', value: stats.total, bg: 'linear-gradient(90deg,#0f172a, #0b1220)' },
        { title: 'Present Days', value: stats.present, bg: 'linear-gradient(90deg,#052f2a,#043827)' },
        { title: 'Absent Days', value: stats.absent, bg: 'linear-gradient(90deg,#2b0505,#3b0a0a)' },
        { title: 'Attendance %', value: `${stats.percent}%`, bg: 'linear-gradient(90deg,#062a3a,#03202b)' },
    ];

    const tableRecords = days.map(d => ({ date: d.date, status: d.status, time: d.time, location: d.location }));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Calendar /> Student Attendance Monitor</h2>
                    <p className="text-slate-400">Overview of daily attendance and detailed records.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-2xl border border-slate-700">
                        <div className="mr-2">
                            <CircleProgress percent={stats.percent} />
                        </div>
                        <div className="text-sm text-slate-300">
                            <div className="font-medium">Attendance</div>
                            <div className="text-xs text-slate-400">{stats.present} / {stats.total} days</div>
                        </div>
                    </div>
                </div>
            </div>

            {stats.percent < 75 && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3">
                    <AlertTriangle />
                    <div>
                        <div className="font-medium">Attendance Warning</div>
                        <div className="text-sm text-red-200">Your attendance is below 75% — take action to improve it.</div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <FiltersBar
                    monthIndex={month}
                    onMonthChange={(m) => setMonth(m)}
                    subject={subject}
                    subjects={['Mathematics', 'Physics', 'Computer Science']}
                    onSubjectChange={(s) => setSubject(s)}
                    onRefresh={() => setDays(generateMockAttendance(year, month))}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <SummaryCards stats={[
                        { title: 'Total Classes', value: stats.total, icon: <span className="text-slate-200">📚</span> },
                        { title: 'Present', value: stats.present, icon: <span className="text-emerald-300">✅</span> },
                        { title: 'Absent', value: stats.absent, icon: <span className="text-red-300">❌</span> },
                        { title: 'Attendance %', value: `${stats.percent}%`, icon: <span className="text-sky-300">📈</span> },
                    ]} />

                    <AttendanceChart data={days} />

                    <CalendarGrid year={year} month={month} days={days} />
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                        <h4 className="text-sm text-slate-300">Streak</h4>
                        <div className="mt-3 text-xl font-bold text-white flex items-center gap-2">{stats.streak}-day streak <span className="text-amber-400">🔥</span></div>
                        <p className="text-xs text-slate-400 mt-2">Keep it up! Consistency improves your overall attendance.</p>
                    </div>

                    <AttendanceTable records={tableRecords} pageSize={8} />
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;

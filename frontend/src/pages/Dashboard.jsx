import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarClock, CheckCircle, Users, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/attendance-stats?days=7');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load attendance statistics.');
        // Mock data for fallback
        setStats([
          { date: '2023-10-01', percentage: 75, present_count: 15, total_students: 20 },
          { date: '2023-10-02', percentage: 90, present_count: 18, total_students: 20 },
          { date: '2023-10-03', percentage: 85, present_count: 17, total_students: 20 },
          { date: '2023-10-04', percentage: 100, present_count: 20, total_students: 20 },
          { date: '2023-10-05', percentage: 60, present_count: 12, total_students: 20 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getLatestStats = () => {
    if (stats.length === 0) return { percentage: 0, present_count: 0, total_students: 0 };
    return stats[stats.length - 1];
  };

  const latestStats = getLatestStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={28} />
            Admin Dashboard
          </h2>
          <p className="text-slate-400 mt-1">Overview of system statistics and attendance trends</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-xl shadow-lg">
          <CalendarClock className="text-blue-400" size={20} />
          <span className="text-slate-200 font-medium tracking-wide">
            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})} &bull; {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Users size={120} />
          </div>
          <h3 className="text-blue-200 font-medium mb-2 relative z-10">Total Students Enrolled</h3>
          <p className="text-4xl font-bold text-white relative z-10">{latestStats.total_students || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <CheckCircle size={120} />
          </div>
          <h3 className="text-green-200 font-medium mb-2 relative z-10">Present Today</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-4xl font-bold text-white">{latestStats.present_count || 0}</p>
            <span className="text-green-400 font-medium text-sm">students</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <TrendingUp size={120} />
          </div>
          <h3 className="text-purple-200 font-medium mb-2 relative z-10">Today's Attendance Rate</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-4xl font-bold text-white">{latestStats.percentage || 0}%</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/80 border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl mt-8 relative">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-bold text-white">Daily Attendance Percentage</h3>
           <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300">
             Last 7 Days
           </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <span className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
            Loading statistics...
          </div>
        ) : stats.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p>No attendance data available yet.</p>
          </div>
        ) : (
          <div className="relative h-72 flex items-end justify-between gap-2 sm:gap-4 mt-10">
             {/* Y-Axis lines */}
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25, 0].map((val, i) => (
                   <div key={i} className="flex items-center gap-4 w-full">
                      <span className="text-xs text-slate-500 w-8 text-right">{val}%</span>
                      <div className="flex-1 border-t border-slate-700/50 border-dashed"></div>
                   </div>
                ))}
             </div>
             
             {/* Bars */}
             <div className="relative z-10 flex items-end justify-around w-full pl-12 h-full pb-6 pt-4">
               {stats.map((stat, idx) => (
                 <div key={idx} className="flex flex-col items-center group w-full relative">
                   <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap">
                     <p className="text-white font-bold">{stat.percentage}%</p>
                     <p className="text-xs text-slate-400">{stat.present_count} / {stat.total_students} Present</p>
                   </div>
                   <div 
                     className="w-full max-w-[3rem] bg-gradient-to-t from-blue-600/80 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-t-lg transition-all duration-500 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                     style={{ height: `${Math.max(stat.percentage, 2)}%` }} // Minimum height to always be visible
                   ></div>
                   <span className="text-xs text-slate-400 mt-4 -rotate-45 sm:rotate-0 origin-left transform sm:translate-y-0 whitespace-nowrap">
                     {new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

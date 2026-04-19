import React, { useState, useEffect } from 'react';
import { CalendarClock, CheckCircle, XCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock configuration: Assuming attendance is open between 8 AM and 10 AM.
  const hours = currentTime.getHours();
  let isAttendanceOpen = false;
  if (hours >= 8 && hours < 22) { // Made wide window for testing
    isAttendanceOpen = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-slate-400">Welcome to Smart Attendance System</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
          <Clock className="text-blue-400" size={20} />
          <span className="text-slate-200 font-medium">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className={`p-6 rounded-2xl border ${isAttendanceOpen ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {isAttendanceOpen ? <CheckCircle size={100} /> : <XCircle size={100} />}
          </div>
          
          <div className="relative z-10">
            <h3 className="text-slate-300 font-medium mb-1">Current Status</h3>
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${isAttendanceOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className={`text-2xl font-bold ${isAttendanceOpen ? 'text-green-400' : 'text-red-400'}`}>
                {isAttendanceOpen ? 'Attendance Open' : 'Attendance Closed'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              {isAttendanceOpen ? 'You can mark attendance now.' : 'Come back during the designated hours.'}
            </p>
          </div>
        </div>

        {/* Info Card 1 */}
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
           <h3 className="text-slate-400 font-medium mb-1">Today's Date</h3>
           <div className="flex items-center gap-3 mt-2">
              <CalendarClock className="text-indigo-400" size={28} />
              <span className="text-2xl font-bold text-slate-200">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}
              </span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

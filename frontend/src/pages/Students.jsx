import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, AlertCircle } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students');
        setStudents(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load students. Please check your connection.');
        setIsLoading(false);
        // Fallback for demonstration if API isn't up
        if (err.message === 'Network Error') {
           setStudents([
              { id: 1, name: 'Anshika', roll_no: '101' },
              { id: 2, name: 'John Doe', roll_no: '102' }
           ]);
        }
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.roll_no.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-400" />
            Registered Students
          </h2>
          <p className="text-slate-400">View all students enrolled in the system</p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && students.length === 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/90 border-b border-slate-700">
                <th className="py-4 px-6 text-sm font-semibold text-slate-300 w-24">ID / #</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Name</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Roll Number</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                       <span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin block"></span>
                    </div>
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-400">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id || index}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-400">{student.id || index + 1}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                           {student.name.charAt(0).toUpperCase()}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300 bg-slate-900/30 rounded inline-block m-2 mt-3">{student.roll_no}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Users, Search, AlertCircle, ScanFace, X, Camera, CheckCircle } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Registration Modal State
  const [registeringStudent, setRegisteringStudent] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const fetchStudents = async () => {
    setIsLoading(true);
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
            { id: 1, name: 'Anshika', roll_no: '101', is_face_registered: true },
            { id: 2, name: 'John Doe', roll_no: '102', is_face_registered: false }
         ]);
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Modal handlers
  const openRegistrationModal = async (student) => {
    setRegisteringStudent(student);
    setUploadStatus({ type: '', message: '' });
    
    // Start camera automatically when modal opens
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setIsCameraReady(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setUploadStatus({ type: 'error', message: 'Camera permission denied.' });
    }
  };

  const closeRegistrationModal = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
    setRegisteringStudent(null);
  };

  // Bind stream to video ref whenever stream/modal changes state
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, registeringStudent]);

  const handleCaptureAndRegister = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    if (!video.videoWidth || !video.videoHeight) {
      setUploadStatus({ type: 'error', message: 'Camera is still initializing. Please wait and try again.' });
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    setIsUploading(true);
    setUploadStatus({ type: '', message: '' });

    try {
      await api.post('/register-face', {
        student_id: registeringStudent.id,
        image_base64: imageBase64
      });

      setUploadStatus({ type: 'success', message: 'Face registered successfully!' });
      
      // Update local state to reflect change without full refetch immediately
      setStudents(students.map(s => s.id === registeringStudent.id ? { ...s, is_face_registered: true } : s));
      
      setTimeout(() => {
        closeRegistrationModal();
      }, 2000);

    } catch (err) {
      setUploadStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Failed to register face.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

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
                <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-center">Face Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                       <span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin block"></span>
                    </div>
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
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
                    
                    <td className="py-4 px-6 text-center">
                       {student.is_face_registered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                             <CheckCircle size={14} /> Registered
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                             Unregistered
                          </span>
                       )}
                    </td>

                    <td className="py-4 px-6 text-right">
                       <button
                         onClick={() => openRegistrationModal(student)}
                         className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           student.is_face_registered 
                           ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                           : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                         }`}
                       >
                         <ScanFace size={16} />
                         {student.is_face_registered ? 'Update Face' : 'Register Face'}
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face Registration Modal */}
      {registeringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <ScanFace className="text-blue-400" />
                   Register Face Data
                 </h3>
                 <button onClick={closeRegistrationModal} className="text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-6">
                 <p className="text-slate-300 mb-4 text-sm">
                   Align <span className="font-semibold text-blue-400">{registeringStudent.name}</span>'s face inside the camera view and capture a clear image.
                 </p>

                 <div className="relative aspect-square w-full bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner mb-6">
                   {stream ? (
                     <video 
                       ref={videoRef} 
                       autoPlay 
                       playsInline 
                       muted 
                       onLoadedMetadata={() => setIsCameraReady(true)}
                       className="w-full h-full object-cover mirror-mode"
                       style={{ transform: "scaleX(-1)" }}
                     />
                   ) : (
                     <div className="flex flex-col items-center text-slate-500">
                        <Camera size={32} className="mb-2" />
                        <span className="text-sm font-medium">Initializing camera...</span>
                     </div>
                   )}
                   
                   <canvas ref={canvasRef} className="hidden" />

                   {/* Scanner UI */}
                   {stream && (
                      <div className="absolute inset-0 border-[6px] border-blue-500/30 rounded-2xl pointer-events-none"></div>
                   )}
                 </div>

                 {uploadStatus.message && (
                   <div className={`p-3 rounded-xl mb-4 text-sm flex items-center gap-2 ${
                     uploadStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                   }`}>
                     {uploadStatus.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                     {uploadStatus.message}
                   </div>
                 )}

                 <button
                   onClick={handleCaptureAndRegister}
                   disabled={!stream || !isCameraReady || isUploading || uploadStatus.type === 'success'}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                 >
                   {isUploading ? (
                     <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Processing...
                     </>
                   ) : uploadStatus.type === 'success' ? 'Registered Successfully' : 'Capture & Save'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Students;

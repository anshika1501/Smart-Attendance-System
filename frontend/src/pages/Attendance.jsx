import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Camera, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Attendance = () => {
  const [stream, setStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Time restriction mock logic
  const checkIsAttendanceOpen = () => {
    const hours = new Date().getHours();
    return hours >= 8 && hours < 22; // Open 8 AM to 10 PM for testing
  };

  useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(() => {
      // Browser autoplay restrictions can reject this promise; user interaction will still start playback.
    });
  }, [stream]);

  const startCamera = async () => {
    try {
      setStatus({ type: '', message: '' });
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setIsCameraReady(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setStatus({ 
        type: 'error', 
        message: 'Camera permission denied or camera not found.' 
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
  };

  const captureImageBase64 = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      if (!video.videoWidth || !video.videoHeight) {
        return null;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Draw video frame on canvas (considering the mirror effect in UI, we don't necessarily have to flip but keeping raw pixels is better for facial recognition)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      return dataUrl;
    }
    return null;
  };

  const handleCaptureAndMark = () => {
    if (!checkIsAttendanceOpen()) {
      setStatus({ 
        type: 'error', 
        message: 'Attendance is closed. You can only mark attendance during designated hours.' 
      });
      return;
    }

    const imageBase64 = captureImageBase64();
    if (!imageBase64) {
       setStatus({ type: 'error', message: 'Camera is still initializing. Please wait a moment and try again.' });
       return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      setIsLoading(false);
      return;
    }

    // Get Location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        try {
          // Send face capture to backend for matching
          const response = await api.post('/mark-attendance', {
             image_base64: imageBase64,
             latitude,
             longitude
          });
          
          setStatus({ 
            type: 'success', 
            message: `Attendance Marked ✅ - ${response.data.message}` 
          });
          
          // Stop camera after successful capture
          stopCamera();

        } catch (error) {
          const errMsg = error.response?.data?.detail || 'Failed to mark attendance. Server error.';
          setStatus({ 
            type: 'error', 
            message: errMsg.includes('Face Not Matched') ? 'Face Not Matched ❌' : errMsg 
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setStatus({ 
          type: 'error', 
          message: 'Location permission denied. Cannot mark attendance without location.' 
        });
        setIsLoading(false);
      },
      {
         enableHighAccuracy: true,
         timeout: 10000,
         maximumAge: 0
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Camera className="text-blue-400" />
          Mark Attendance
        </h2>
        <p className="text-slate-400">Position your face in the frame and ensure location services are enabled.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          status.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {status.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" /> : <XCircle className="shrink-0 mt-0.5" />}
          <div>
            <p className="font-medium">{status.type === 'success' ? 'Success' : 'Failed'}</p>
            <p className="text-sm opacity-90">{status.message}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl shadow-xl">
        {/* Camera Viewport */}
        <div className="relative aspect-[4/3] sm:aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-700/50 mb-6">
          {stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              onLoadedMetadata={() => setIsCameraReady(true)}
              className="w-full h-full object-cover mirror-mode"
              style={{ transform: "scaleX(-1)" }} // Mirror effect for webcams
            />
          ) : (
            <div className="text-center p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
                <Camera size={32} />
              </div>
              <p className="text-slate-400 font-medium">Camera is off</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Start camera to verify your identity and mark your attendance.</p>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner overlay effect */}
          {stream && (
            <div className="absolute inset-x-0 inset-y-0 pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-blue-500/50 rounded-full sm:rounded-3xl"></div>
               {isLoading && (
                 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="animate-spin text-blue-500" size={32} />
                       <span className="text-white font-medium bg-slate-900/80 px-3 py-1 rounded-full text-sm">Processing verification...</span>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!stream ? (
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              disabled={isLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle size={18} />
              Stop Camera
            </button>
          )}

          <button
            onClick={handleCaptureAndMark}
            disabled={!stream || !isCameraReady || isLoading}
            className={`w-full font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              !stream || !isCameraReady || isLoading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700' 
                : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            Capture & Mark
          </button>
        </div>

        {location && status.type === 'success' && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
               <MapPin size={20} />
             </div>
             <div>
               <p className="text-sm text-slate-400">Captured Location Data</p>
               <p className="font-mono text-sm text-slate-300 mt-1">
                 Lat: {location.lat.toFixed(6)} <br/>
                 Lng: {location.lng.toFixed(6)}
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;

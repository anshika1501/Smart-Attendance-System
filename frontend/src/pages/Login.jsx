import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      // Temporary simulated behavior
      setTimeout(() => {
        if (email.includes('@')) {
          localStorage.setItem('token', 'fake-jwt-token-12345');
          localStorage.setItem('userName', email.split('@')[0]);
          navigate('/dashboard');
        } else {
          setError('Invalid login credentials.');
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row selection:bg-blue-500/30 overflow-hidden">
      {/* Left side: Background Presentation */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-slate-950 border-r border-slate-800">
        {/* Animated image background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply z-10 block"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-transparent z-10"></div>
          <img 
            src="/login-bg.png" 
            alt="Abstract Technology background" 
            className="w-full h-full object-cover animate-slow-zoom"
          />
        </div>

        {/* Content on top of background */}
        <div className="relative z-20 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-blue-600 flex flex-shrink-0 items-center justify-center shadow-lg shadow-blue-500/40">
             <span className="text-white font-bold text-xl leading-none">S</span>
           </div>
           <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
             SmartAttend
           </span>
        </div>

        <div className="relative z-20 max-w-md mt-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            The Future of <br/>
            <span className="text-blue-400">Attendance</span> Tracking
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mix-blend-luminosity">
            Secure, fast, and seamless identity verification using the latest computer vision and geospatial technologies.
          </p>
        </div>
        
        {/* Abstract decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-10"></div>
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none z-10"></div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 min-h-screen relative">
        {/* Mobile Logo Only Form */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
             <span className="text-white font-bold text-sm">S</span>
           </div>
           <span className="text-xl font-bold text-slate-100">SmartAttend</span>
        </div>

        <div className="w-full max-w-sm mt-10 lg:mt-0 relative z-10">
          <div className="mb-10 text-left lg:text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Welcome Back</h1>
            <p className="text-slate-400">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-medium text-slate-300 block">Password</label>
                 <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative flex items-center py-4">
             <div className="flex-grow border-t border-slate-700"></div>
             <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-medium">Or continue with</span>
             <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

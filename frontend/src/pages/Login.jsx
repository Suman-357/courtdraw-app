import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 font-body-md text-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="flex items-center gap-3 mb-8 text-primary">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-fixed text-headline-lg">sports_tennis</span>
        </div>
        <h1 className="text-display-md font-display-md font-bold text-primary-fixed tracking-tight">ShuttlePro</h1>
      </div>

      <div className="w-full max-w-md bg-[#1E2022] border border-[#2D3135] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-8 pb-4 space-y-2">
          <h3 className="text-headline-md font-headline-md font-bold text-primary text-center">Welcome Back</h3>
          <p className="text-on-surface-variant text-center font-body-md">Enter your credentials to manage your club.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="p-8 pt-4 space-y-5">
            <div className="space-y-2 text-left">
              <label htmlFor="username" className="text-on-surface-variant font-label-md block">Username</label>
              <input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin" 
                className="bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-12 w-full rounded-lg px-4 outline-none transition-colors"
                required 
              />
            </div>
            <div className="space-y-2 text-left">
              <label htmlFor="password" className="text-on-surface-variant font-label-md block">Password</label>
              <input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-12 w-full rounded-lg px-4 outline-none transition-colors"
                required 
              />
            </div>
            {error && (
              <div className="p-3 bg-error-container/20 border border-error/30 text-error text-sm rounded-lg text-center">
                {error}
              </div>
            )}
          </div>
          <div className="p-8 pt-0">
            <button className="w-full h-12 bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim transition-colors rounded-lg font-label-md font-bold flex justify-center items-center disabled:opacity-50" type="submit" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
      

    </div>
  );
}

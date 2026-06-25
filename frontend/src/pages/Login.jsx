import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import Header from '../components/Header';
import ClayCard from '../components/ui/ClayCard';
import ClayButton from '../components/ui/ClayButton';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-wander-base min-h-screen text-wander-textMain font-sans flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 mt-16">
        <ClayCard className="w-full max-w-md !p-10 relative overflow-hidden group border-none bg-wander-base/40 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_2px_10px_rgba(255,255,255,0.05)]">
          <div className="absolute top-[-50%] left-[-20%] w-64 h-64 rounded-full bg-wander-accent/20 blur-[60px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-[-30%] right-[-10%] w-48 h-48 rounded-full bg-wander-primary/20 blur-[50px] mix-blend-screen pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black font-syne tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-2">Admin Access</h2>
            <p className="text-wander-textMuted mb-8 font-medium">Enter your password to continue.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-wander-primary/50 focus:ring-1 focus:ring-wander-primary/50 text-white placeholder:text-white/30 transition-all font-medium backdrop-blur-xl shadow-inner"
                  disabled={loading} />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
              <ClayButton
                type="submit"
                className="w-full !py-4 text-base tracking-wide font-bold"
                disabled={loading || !password}>
                {loading ? 'Authenticating...' : 'Login'}
              </ClayButton>
            </form>
          </div>
        </ClayCard>
      </div>
    </div>
  );
};

export default Login;
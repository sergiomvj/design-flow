import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSetupSecret, setAdminSetupSecret] = useState('');
  const [enableAdminBootstrap, setEnableAdminBootstrap] = useState(false);
  const [wantsAdminAccess, setWantsAdminAccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function loadAuthConfig() {
      try {
        const res = await fetch('/api/auth/config');
        if (!res.ok) return;

        const data = await res.json();
        setEnableAdminBootstrap(Boolean(data.enableAdminBootstrap));
      } catch {
        setEnableAdminBootstrap(false);
      }
    }

    void loadAuthConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: Record<string, string> = { name, email, password };

    if (enableAdminBootstrap && wantsAdminAccess && adminSetupSecret.trim()) {
      payload.adminSetupSecret = adminSetupSecret.trim();
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        navigate('/login');
      } else {
        setError(data.details ? `${data.error}: ${data.details}` : (data.error || 'Registration failed'));
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 md:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-[480px]">
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-primary/10 border border-zinc-100 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8 md:space-y-10">
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 signature-gradient rounded-[20px] md:rounded-[24px] flex items-center justify-center text-white font-black text-xl md:text-2xl mx-auto shadow-xl shadow-primary/20 -rotate-3">F</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-950">Join FBR Flow</h1>
                <p className="text-zinc-400 font-bold text-[10px] md:text-sm tracking-tight mt-2 uppercase tracking-[0.1em]">Create your client access profile</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 pl-12 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all"
                    placeholder="Alexander Thorne"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Business Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 pl-12 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 pl-12 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all"
                    placeholder="........"
                  />
                </div>
              </div>

              {enableAdminBootstrap && (
                <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsAdminAccess}
                      onChange={(e) => setWantsAdminAccess(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                      Criar conta como admin para testes
                    </span>
                  </label>

                  {wantsAdminAccess && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 ml-2">Admin Setup Secret</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <input
                          type="password"
                          required
                          value={adminSetupSecret}
                          onChange={(e) => setAdminSetupSecret(e.target.value)}
                          className="w-full bg-white border border-amber-200 focus:bg-white focus:border-amber-400 p-4 pl-12 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all"
                          placeholder="Temporary admin bootstrap secret"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Public sign-up creates a `CLIENT` account. Admin bootstrap only stays active during the test phase.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full signature-gradient p-4 md:p-5 rounded-2xl text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 md:pt-8 border-t border-zinc-50 text-center">
              <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
        <p className="text-center mt-6 md:mt-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] px-4">
          Join the Premium Design Network
        </p>
      </div>
    </div>
  );
}

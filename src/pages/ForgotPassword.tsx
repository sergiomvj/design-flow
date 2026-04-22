import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Recovery request sent.');
      } else {
        setError(data.details ? `${data.error}: ${data.details}` : (data.error || 'Recovery failed'));
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
              <div className="w-14 h-14 md:w-16 md:h-16 signature-gradient rounded-[20px] md:rounded-[24px] flex items-center justify-center text-white font-black text-xl md:text-2xl mx-auto shadow-xl shadow-primary/20 -rotate-3">
                F
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-950">Forgot Password</h1>
                <p className="text-zinc-400 font-bold text-[10px] md:text-sm tracking-tight mt-2 uppercase tracking-[0.1em]">
                  Request assisted access recovery
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-4">
                <ShieldAlert className="mt-0.5 text-amber-500" size={18} />
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-700 leading-relaxed">
                  We are not using Supabase Auth for password reset yet. During this phase, recovery is handled with admin assistance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                  {message}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full signature-gradient p-4 md:p-5 rounded-2xl text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Request Recovery
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 md:pt-8 border-t border-zinc-50 text-center">
              <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline">
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
        <p className="text-center mt-6 md:mt-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] px-4">
          Recovery managed with internal security review
        </p>
      </div>
    </div>
  );
}

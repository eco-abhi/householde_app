'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError('Invalid PIN. Please try again.');
                setPin('');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 animate-in zoom-in duration-300">
                        <Home className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">Pandey's Household</h1>
                    <p className="text-slate-500 text-lg">Welcome back to your home</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200/60 p-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Enter PIN Code
                        </label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="••••"
                            maxLength={6}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 text-center text-2xl font-bold tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-semibold text-center animate-in slide-in-from-top duration-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-200/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </span>
                        ) : (
                            'Enter'
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Your session will remain active for 30 days
                    </p>
                </form>
            </div>
        </div>
    );
}


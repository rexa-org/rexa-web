import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiShield, FiUser } from 'react-icons/fi';

export const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLoginSuccess = () => {
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect');
        
        if (redirectTo && 
            redirectTo !== '/signin' && 
            redirectTo !== '/register' && 
            !redirectTo.includes('redirect=')) {
            navigate(redirectTo);
        } else {
            navigate('/');
        }
        toast.success('Welcome back to reXa! 🎉');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            handleLoginSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async (role: 'user' | 'admin') => {
        setIsLoading(true);
        const demoEmail = role === 'admin' ? 'admin@rexa.com' : 'jane@rexa.com';
        const demoPassword = 'password123';

        try {
            await login(demoEmail, demoPassword);
            handleLoginSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sign in as demo user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950/40 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 relative z-10"
            >
                {/* Branding Title */}
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        reXa
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Sign in to the reward exchange marketplace
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                <FiMail className="w-5 h-5" />
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                placeholder="Email address"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                <FiLock className="w-5 h-5" />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                {/* VC Quick Login Panel */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
                    <p className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Pitch Demo One-Click Access (VC Mode)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('user')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                        >
                            <FiUser className="w-3.5 h-3.5 text-cyan-500" />
                            Demo User
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('admin')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                        >
                            <FiShield className="w-3.5 h-3.5 text-indigo-500" />
                            Demo Admin
                        </button>
                    </div>
                </div>

                {/* Footer Switch page links */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link 
                        to="/register" 
                        className="font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 transition-colors"
                    >
                        Register here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
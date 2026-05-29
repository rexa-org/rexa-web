import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiShield, FiCheckCircle, FiClock, FiLock as FiOtpIcon } from 'react-icons/fi';

export const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.error('Registration is closed during the private beta. Please join the waitlist on the home page! 🎉');
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (otp.length !== 6 || isNaN(Number(otp))) {
            toast.error('Please enter a valid 6-digit OTP code');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.verifyOtp({ userId, otp });
            toast.success(res.data.message || 'Email verified successfully! 🎉');
            navigate('/signin', {
                state: {
                    email: formData.email,
                    message: 'Verification complete! Please sign in with your credentials.',
                },
            });
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'OTP verification failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await authApi.resendOtp(formData.email);
            setTimeLeft(600); // reset 10 minutes
            toast.success('A new OTP has been sent to your email.');
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to resend OTP.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 6) {
            setOtp(val);
        }
    };

    useEffect(() => {
        if (isOtpStep && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOtpStep, timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950/40 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background vector glow elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 relative z-10"
            >
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        reXa
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {isOtpStep ? 'Email Verification Required' : 'Create your digital exchange account'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!isOtpStep ? (
                        <motion.form 
                            key="register-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5" 
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-4">
                                {/* Name Input */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                        <FiUser className="w-5 h-5" />
                                    </span>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                        placeholder="Full name"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                        <FiMail className="w-5 h-5" />
                                    </span>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
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
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                        placeholder="Create password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link 
                                    to="/signin" 
                                    className="font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 transition-colors"
                                >
                                    Sign In here
                                </Link>
                            </p>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="otp-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5" 
                            onSubmit={handleOtpSubmit}
                        >
                            <div className="bg-cyan-500/10 dark:bg-cyan-400/5 border border-cyan-500/20 dark:border-cyan-400/10 rounded-2xl p-4 flex items-start gap-3">
                                <FiCheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    A 6-digit OTP code has been dispatched to <span className="font-bold">{formData.email}</span>. Please verify your address.
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* OTP Input */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                        <FiOtpIcon className="w-5 h-5" />
                                    </span>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={handleOtpChange}
                                        disabled={loading}
                                        className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center font-mono font-bold tracking-widest text-lg transition-all"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <FiClock />
                                    {timeLeft > 0 ? (
                                        <span>Expires in {formatTime(timeLeft)}</span>
                                    ) : (
                                        <span className="text-red-500 font-semibold">Expired</span>
                                    )}
                                </span>
                                
                                {timeLeft === 0 && (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 transition"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || timeLeft === 0}
                                className="group w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? 'Verifying OTP...' : 'Verify OTP & Complete Register'}
                                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOtpStep(false)}
                                className="w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                Back to sign up details
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
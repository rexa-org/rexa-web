import { Link } from 'react-router-dom';
import { FiHome, FiCompass } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
            {/* Celestial Ambient Glow Backgrounds */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />

            {/* Micro stars particles */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="max-w-md w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden"
            >
                {/* Visual top border light */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
                
                {/* Floating compass logo illustration */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto"
                >
                    <FiCompass className="w-8 h-8 animate-spin-slow" />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        404
                    </h1>
                    <h2 className="text-xl font-bold tracking-tight text-slate-100">
                        Cosmic Boundaries Exceeded
                    </h2>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto font-medium">
                        You have drifted out of the reXa ledger workspace. The endpoint you are seeking is either uninitialized or has dissolved in orbit.
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all mx-auto"
                    >
                        <FiHome className="w-4 h-4 stroke-[3px]" />
                        Back to Safe Orbit
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}; 
export default NotFound;
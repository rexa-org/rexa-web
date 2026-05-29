import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, transactionApi } from '../services/api';
import { PageLayout } from '../components/PageLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  FiCreditCard, FiTrendingUp, FiTrendingDown, FiShield,
  FiSun, FiClock, FiCheck, FiRefreshCw, FiZap, FiAward,
  FiArrowUpRight, FiArrowDownLeft, FiGift, FiSliders
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Transaction {
  _id: string;
  fromUser?: { _id: string; name: string; email: string };
  toUser?: { _id: string; name: string; email: string };
  points: number;
  reward?: { _id: string; title: string; points: number };
  type: 'redemption' | 'exchange' | 'checkin' | 'signup_bonus' | 'admin_adjustment';
  createdAt: string;
}

export const Wallet = () => {
  const { user, fetchProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionApi.getHistory();
      const data = Array.isArray(response.data) ? response.data : [];
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const canCheckIn = () => {
    if (!user?.lastCheckIn) return true;
    const lastCheckIn = new Date(user.lastCheckIn).getTime();
    const now = Date.now();
    return (now - lastCheckIn) >= 24 * 60 * 60 * 1000;
  };

  const getTimeUntilNextCheckIn = () => {
    if (!user?.lastCheckIn) return null;
    const lastCheckIn = new Date(user.lastCheckIn).getTime();
    const cooldown = 24 * 60 * 60 * 1000;
    const remaining = cooldown - (Date.now() - lastCheckIn);
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 105)); // approximate minutes
    return `${hours}h ${minutes}m`;
  };

  const handleDailyCheckIn = async () => {
    try {
      setCheckingIn(true);
      await authApi.checkin();
      setCheckinSuccess(true);
      toast.success('🎉 Claimed 50 daily reX Points!');
      await fetchProfile();
      await fetchTransactions();
      setTimeout(() => setCheckinSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'redemption': return <FiGift className="w-4 h-4" />;
      case 'exchange': return <FiRefreshCw className="w-4 h-4" />;
      case 'checkin': return <FiSun className="w-4 h-4" />;
      case 'signup_bonus': return <FiAward className="w-4 h-4" />;
      case 'admin_adjustment': return <FiSliders className="w-4 h-4" />;
      default: return <FiCreditCard className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'redemption': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'exchange': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'checkin': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'signup_bonus': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'admin_adjustment': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isCredit = (tx: Transaction) => {
    return tx.toUser?._id === user?._id;
  };

  if (loading) return <LoadingSpinner />;

  const trustScore = user?.trustScore ?? 100;
  const checkInReady = canCheckIn();
  const timeRemaining = getTimeUntilNextCheckIn();

  return (
    <PageLayout title="Wallet">
      {/* Top Stats & Visual Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Sleek Credit-Card Mockup for Balance */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white p-6 rounded-3xl shadow-xl shadow-cyan-500/10 border border-slate-750 flex flex-col justify-between h-52 min-w-[280px]"
        >
          {/* Card vector details */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full translate-y-8 -translate-x-8 blur-2xl" />
          
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Digital Ledger Card</p>
              <h4 className="text-xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
                  reXa Points
              </h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <FiCreditCard className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="z-10 mt-4">
            <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Available Balance</p>
            <p className="text-4xl font-black font-mono tracking-tighter mt-0.5">
                {user?.points ?? 0} <span className="text-xs text-cyan-400 font-sans tracking-normal font-bold">PTS</span>
            </p>
          </div>

          <div className="flex justify-between items-center z-10 mt-auto pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono tracking-widest text-slate-400">
                {user?.name.toUpperCase()}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
                ACTIVE SWAPPER
            </span>
          </div>
        </motion.div>

        {/* Stats and score trackers */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Lifetime Earned Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-0.5 text-emerald-500 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                <FiArrowUpRight className="w-3.5 h-3.5" />
                <span>Earns</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400">Lifetime Earned</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{user?.lifetimeEarned ?? 100}</p>
              <p className="text-[10px] text-gray-400 mt-1">Total points credited</p>
            </div>
          </div>

          {/* Lifetime Spent Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <FiTrendingDown className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-0.5 text-rose-500 font-bold text-[10px] bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                <FiArrowDownLeft className="w-3.5 h-3.5" />
                <span>Debit</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400">Lifetime Spent</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{user?.lifetimeSpent ?? 0}</p>
              <p className="text-[10px] text-gray-400 mt-1">Total points redeemed</p>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500">
                <FiShield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-cyan-500 bg-cyan-50 dark:bg-cyan-900/25 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400">Trust Score</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{trustScore}%</p>
              
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 rounded-full"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-In Card */}
      <div className={`mb-8 p-6 rounded-3xl border relative overflow-hidden transition-all duration-500 ${
        checkInReady
          ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/20 dark:to-transparent border-amber-200/50 dark:border-amber-900/30 shadow-lg shadow-amber-500/5'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 shadow-md'
      }`}>
        {checkInReady && (
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border ${
              checkInReady
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-transparent'
                : 'bg-gray-50 dark:bg-gray-900/60 text-gray-400 border-gray-100 dark:border-gray-800/80'
            }`}>
              {checkinSuccess ? (
                <FiCheck className="w-7 h-7 animate-bounce" />
              ) : (
                <FiSun className={`w-7 h-7 ${checkInReady ? 'animate-spin-slow text-amber-100' : ''}`} />
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Daily Check-In</h3>
              {checkInReady ? (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <FiZap className="w-4 h-4 fill-current animate-pulse" /> +50 points waiting for you!
                </p>
              ) : (
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <FiClock className="w-4 h-4" /> Next claim available in {timeRemaining || 'under 24 hours'}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleDailyCheckIn}
            disabled={!checkInReady || checkingIn}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-95 ${
              checkInReady
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {checkingIn ? (
              <FiRefreshCw className="w-5 h-5 animate-spin mx-auto" />
            ) : checkinSuccess ? (
              <span className="flex items-center justify-center gap-1"><FiCheck /> Claimed!</span>
            ) : checkInReady ? (
              'Claim 50 Points'
            ) : (
              'Claimed ✓'
            )}
          </button>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/40">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiClock className="text-cyan-500" /> Account Ledger
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Recent account point movements</p>
          </div>
          <button 
            onClick={() => window.location.href='/transactions'}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 transition"
          >
            View All Ledger
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <FiCreditCard className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 font-semibold text-sm">No transactions logged yet</p>
            <p className="text-xs text-gray-450 mt-1">Transfer, list, or check in to log point transactions.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/40">
            {transactions.slice(0, 5).map((tx) => {
              const credit = isCredit(tx);
              return (
                <div
                  key={tx._id}
                  className="flex items-center gap-4 px-6 py-4.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors"
                >
                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getTypeBadgeColor(tx.type)} border-transparent`}>
                    {getTypeIcon(tx.type)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-800 dark:text-white capitalize">
                        {tx.type.replace('_', ' ')}
                      </span>
                      {tx.reward && (
                        <span className="text-xs text-gray-400 truncate max-w-[140px] font-medium bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {tx.reward.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className={`text-right font-black text-sm flex items-center gap-1.5 ${
                    credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {credit ? (
                      <FiArrowDownLeft className="w-4 h-4 stroke-[3px]" />
                    ) : (
                      <FiArrowUpRight className="w-4 h-4 stroke-[3px]" />
                    )}
                    {credit ? '+' : '-'}{Math.abs(tx.points)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

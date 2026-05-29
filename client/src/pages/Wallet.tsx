import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, transactionApi } from '../services/api';
import { PageLayout } from '../components/PageLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  FiCreditCard, FiTrendingUp, FiTrendingDown, FiShield,
  FiSun, FiClock, FiCheck, FiRefreshCw, FiZap, FiAward,
  FiArrowUpRight, FiArrowDownLeft, FiGift, FiUserCheck, FiSliders
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
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
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
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Balance */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-5 rounded-3xl shadow-lg shadow-cyan-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-4 -translate-y-8" />
          <FiCreditCard className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-xs font-medium opacity-80">Current Balance</p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user?.points ?? 0}</p>
          <p className="text-[10px] opacity-70 mt-1">reX Points</p>
        </div>

        {/* Lifetime Earned */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiTrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-xs font-medium text-gray-400">Lifetime Earned</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{user?.lifetimeEarned ?? 100}</p>
          <div className="flex items-center gap-1 mt-1">
            <FiArrowUpRight className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-semibold">Income</span>
          </div>
        </div>

        {/* Lifetime Spent */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiTrendingDown className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-xs font-medium text-gray-400">Lifetime Spent</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{user?.lifetimeSpent ?? 0}</p>
          <div className="flex items-center gap-1 mt-1">
            <FiArrowDownLeft className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-red-400 font-semibold">Expenditure</span>
          </div>
        </div>

        {/* Trust Score */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiShield className="w-5 h-5 text-cyan-500 mb-2" />
          <p className="text-xs font-medium text-gray-400">Trust Score</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{trustScore}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Check-In Card */}
      <div className={`mb-8 p-6 rounded-3xl border relative overflow-hidden transition-all duration-500 ${
        checkInReady
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30 shadow-lg shadow-amber-500/10'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 shadow-md'
      }`}>
        {checkInReady && (
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/20 dark:bg-amber-400/10 rounded-full animate-pulse" />
        )}
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
              checkInReady
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}>
              {checkinSuccess ? (
                <FiCheck className="w-7 h-7 animate-bounce" />
              ) : (
                <FiSun className={`w-7 h-7 ${checkInReady ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Daily Check-In</h3>
              {checkInReady ? (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <FiZap className="w-4 h-4" /> +50 reX Points waiting for you!
                </p>
              ) : (
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <FiClock className="w-4 h-4" /> Next check-in in {timeRemaining}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleDailyCheckIn}
            disabled={!checkInReady || checkingIn}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform ${
              checkInReady
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 active:scale-95'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {checkingIn ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : checkinSuccess ? (
              <span className="flex items-center gap-1"><FiCheck /> Claimed!</span>
            ) : checkInReady ? (
              'Claim Now'
            ) : (
              'Claimed ✓'
            )}
          </button>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiClock className="text-cyan-500" /> Transaction Ledger
          </h2>
          <p className="text-xs text-gray-400 mt-1">Complete history of all point movements</p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <FiCreditCard className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">Your point activity will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {transactions.map((tx) => {
              const credit = isCredit(tx);
              return (
                <div
                  key={tx._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeBadgeColor(tx.type)}`}>
                    {getTypeIcon(tx.type)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white capitalize">
                        {tx.type.replace('_', ' ')}
                      </span>
                      {tx.reward && (
                        <span className="text-xs text-gray-400 truncate max-w-[140px]">
                          — {tx.reward.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className={`text-right font-bold text-sm flex items-center gap-1 ${
                    credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {credit ? (
                      <FiArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <FiArrowUpRight className="w-4 h-4" />
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

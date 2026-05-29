import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rewardApi, transactionApi, requestApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FiEdit2, FiTrash2, FiLoader, FiCheck, FiAlertCircle, 
  FiCalendar, FiTag, FiShoppingBag, FiRefreshCw, 
  FiMessageSquare, FiAward, FiUserCheck, FiChevronLeft, FiLock, FiUnlock, FiCopy
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface Reward {
  _id: string;
  title: string;
  description: string;
  points: number;
  code?: string;
  expiryDate: string;
  category?: { _id: string; name: string };
  owner: { _id: string; name: string; email: string; trustScore?: number };
  image_url: string;
  status: 'available' | 'redeemed' | 'exchanged' | 'pending';
  redeemedBy?: string;
}

export const RewardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updatePoints } = useAuth();
  
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Exchange Swap Modal State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [myAvailableRewards, setMyAvailableRewards] = useState<Reward[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [offeredPoints, setOfferedPoints] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [submittingSwap, setSubmittingSwap] = useState(false);

  useEffect(() => { 
    fetchReward(); 
  }, [id]);

  const fetchReward = async () => {
    try {
      const response = await rewardApi.getById(id!);
      setReward(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reward');
      toast.error('Failed to load reward');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAvailableRewards = async () => {
    try {
      const response = await rewardApi.getMyRewards();
      const rewardsData = Array.isArray(response.data.data) ? response.data.data : [];
      const available = rewardsData.filter((r: any) => r.status === 'available');
      setMyAvailableRewards(available);
    } catch (err) {
      console.error('Failed to fetch my available rewards:', err);
      toast.error('Failed to fetch your rewards for swap');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    try {
      await rewardApi.delete(id!);
      toast.success('Reward deleted successfully');
      navigate('/marketplace');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete reward');
    }
  };

  const handleRedeem = async () => {
    if (!reward) return;
    if (!window.confirm(`Redeem this reward for ${reward.points} points?`)) return;
    try {
      setLoading(true);
      const response = await transactionApi.redeemReward(reward._id);
      const updatedPts = response.data.updatedRedeemingUser?.points || (user!.points - reward.points);
      updatePoints?.(updatedPts);
      toast.success('Reward redeemed successfully! Code unlocked.');
      fetchReward();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSwapModal = () => {
    fetchMyAvailableRewards();
    setIsSwapModalOpen(true);
  };

  const handleSendSwapOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reward) return;
    if (!selectedRewardId && !offeredPoints) {
      toast.error('Please select a reward or offer points compensation for the swap.');
      return;
    }

    try {
      setSubmittingSwap(true);
      const data = {
        offeredRewardId: selectedRewardId || undefined,
        offeredPoints: offeredPoints ? Number(offeredPoints) : undefined,
        message: swapMessage || undefined
      };

      await requestApi.create(reward._id, data);
      toast.success('Your swap offer has been proposed! 🚀');
      setIsSwapModalOpen(false);
      navigate('/exchange-requests');
    } catch (err: any) {
      console.error('Swap proposal error:', err);
      toast.error(err.response?.data?.message || 'Failed to propose swap offer');
    } finally {
      setSubmittingSwap(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard!');
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Listing Error</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">{error}</p>
        <button onClick={() => navigate('/marketplace')} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl transition">
          Back to Marketplace
        </button>
      </div>
    );
  }
  if (!reward) return null;

  const isOwner = user?._id === reward.owner._id;
  const trustScore = reward.owner.trustScore ?? 100;

  const getStatusColor = () => {
    switch (reward.status) {
      case 'available': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400';
      case 'redeemed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      case 'exchanged': return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const getStatusIcon = () => {
    switch (reward.status) {
      case 'available': return <FiCheck className="w-3.5 h-3.5" />;
      case 'redeemed': return <FiShoppingBag className="w-3.5 h-3.5" />;
      case 'exchanged': return <FiRefreshCw className="w-3.5 h-3.5" />;
      case 'pending': return <FiAlertCircle className="w-3.5 h-3.5 animate-pulse" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20 text-slate-800 dark:text-slate-100 flex justify-center items-start">
      <div className="max-w-4xl w-full">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/marketplace')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 mb-6 transition"
        >
          <FiChevronLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-850 flex flex-col md:flex-row min-h-[500px]"
        >
          {/* Left Side: Premium Image Container */}
          <div className="relative md:w-5/12 h-[280px] md:h-auto overflow-hidden bg-slate-950 flex-shrink-0 group">
            <img
              src={reward.image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'}
              alt={reward.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Absolute Badges */}
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-extrabold uppercase bg-slate-900/75 text-white/90 backdrop-blur border border-white/10 px-3 py-1 rounded-full">
                {reward.category?.name || 'Voucher'}
              </span>
            </div>
          </div>

          {/* Right Side: Details dashboard */}
          <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              
              {/* Top controls and status indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor()}`}> 
                  {getStatusIcon()} 
                  {reward.status}
                </span>
                
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/rewards/${id}/edit`)} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition"
                      title="Edit Reward Details"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-xl transition"
                      title="Delete Reward Listing"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {reward.title}
              </h1>

              {/* Owner Trust score widget */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {reward.owner.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold">Listing Publisher</p>
                  <p className="font-bold text-slate-800 dark:text-slate-250 truncate text-sm">
                    {reward.owner.name}
                  </p>
                </div>
                
                {/* Visual Trust Indicator */}
                <div className="flex items-center gap-3 border-l border-slate-200/40 pl-3 flex-shrink-0">
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-slate-450 uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <FiUserCheck className="text-cyan-500" /> Trust Score
                    </span>
                    <span className={`text-sm font-black ${trustScore >= 80 ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-500'}`}>
                      {trustScore}%
                    </span>
                  </div>
                  {/* Small progress meter ring */}
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="13" className="stroke-slate-200 dark:stroke-slate-800" fill="none" strokeWidth="2.5" />
                      <circle 
                        cx="16" 
                        cy="16" 
                        r="13" 
                        className="stroke-cyan-500" 
                        fill="none" 
                        strokeWidth="2.5" 
                        strokeDasharray={81.6} 
                        strokeDashoffset={81.6 - (81.6 * trustScore) / 100}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description body */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Product Description</h4>
                <p className="text-slate-600 dark:text-slate-350 leading-relaxed text-sm">
                  {reward.description}
                </p>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/10 dark:border-cyan-500/5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                    <FiShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest font-extrabold">Swapping Value</p>
                    <p className="font-extrabold text-base text-slate-850 dark:text-white mt-0.5">{reward.points} PTS</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-rose-500/5 to-transparent border border-rose-500/10 dark:border-rose-500/5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-450 flex-shrink-0">
                    <FiCalendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest font-extrabold">Voucher Expiry</p>
                    <p className="font-extrabold text-xs text-slate-850 dark:text-white mt-0.5">
                      {new Date(reward.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure unlock display */}
              <AnimatePresence>
                {reward.code ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl space-y-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <FiUnlock className="w-3.5 h-3.5 animate-bounce" /> Secure Voucher Code Unlocked!
                      </p>
                      <button 
                        onClick={() => copyCode(reward.code!)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                      >
                        <FiCopy /> Copy code
                      </button>
                    </div>
                    <code className="font-mono bg-white dark:bg-slate-950 border border-emerald-100 dark:border-emerald-950 px-4 py-3 rounded-xl block text-center text-xl font-black text-slate-850 dark:text-white tracking-widest uppercase select-all shadow-inner border-dashed">
                      {reward.code}
                    </code>
                  </motion.div>
                ) : (
                  !isOwner && reward.status === 'available' && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <FiLock className="text-cyan-500 w-4 h-4 flex-shrink-0" />
                      <span>Code details are locked. Swap or redeem this voucher to decrypt the code.</span>
                    </div>
                  )
                )}
              </AnimatePresence>
            </div>

            {/* Actions for other users */}
            {!isOwner && reward.status === 'available' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/30">
                <button
                  onClick={handleRedeem}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-cyan-500/10 active:scale-98 transition flex items-center justify-center gap-2"
                >
                  <FiShoppingBag className="w-4 h-4 stroke-[3px]" /> Redeem with Points
                </button>
                
                <button
                  onClick={handleOpenSwapModal}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '4s' }} /> Propose Exchange Swap
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Premium Proposal swap overlay modal */}
      <AnimatePresence>
        {isSwapModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />

              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FiRefreshCw className="text-cyan-500" />
                    Propose Swap Offer
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Propose a trade deal to acquire {reward.title}</p>
                </div>
                <button
                  onClick={() => setIsSwapModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendSwapOffer} className="space-y-4">
                
                {/* Proposed reward dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                    <FiTag className="text-cyan-500" /> Select a reward from your list to trade
                  </label>
                  {myAvailableRewards.length > 0 ? (
                    <select
                      value={selectedRewardId}
                      onChange={(e) => setSelectedRewardId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-550 transition font-bold text-xs"
                    >
                      <option value="">-- No Reward (Points-only offer) --</option>
                      {myAvailableRewards.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.title} ({r.points} pts)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-[11px] font-bold">
                      No active listings available to offer. You can still propose points as compensation.
                    </div>
                  )}
                </div>

                {/* Point compensation input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                    <FiAward className="text-amber-500" /> Additional Points Compensation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 50 (sweeten the proposal)"
                      value={offeredPoints}
                      onChange={(e) => setOfferedPoints(e.target.value)}
                      className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-550 text-xs font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase font-black text-slate-400 tracking-wider">
                      reX pts
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1">
                    Your balance: <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{user?.points} pts</span>
                  </p>
                </div>

                {/* Pitch Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                    <FiMessageSquare className="text-cyan-500" /> Proposal Note
                  </label>
                  <textarea
                    placeholder="Briefly message the owner to explain your proposal..."
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-550 text-xs resize-none leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setIsSwapModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-850 text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSwap}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
                  >
                    {submittingSwap ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5 stroke-[3px]" />}
                    <span>Submit Proposal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

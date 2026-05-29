import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rewardApi, transactionApi, requestApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiLoader, FiCheck, FiAlertCircle, FiCalendar, FiTag, FiShoppingBag, FiRefreshCw, FiMessageSquare, FiAward, FiUserCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
      // Filter only available rewards
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
      navigate('/');
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
      // Backend returns updated user points
      const updatedPts = response.data.updatedRedeemingUser?.points || (user!.points - reward.points);
      updatePoints?.(updatedPts);
      toast.success('Reward redeemed successfully! The code has been unlocked.');
      fetchReward(); // Refresh to show the code
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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-12 font-semibold">{error}</div>;
  if (!reward) return null;

  const isOwner = user?._id === reward.owner._id;

  const getStatusColor = () => {
    switch (reward.status) {
      case 'available': return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800/50';
      case 'redeemed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'exchanged': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (reward.status) {
      case 'available': return <FiCheck className="w-4 h-4" />;
      case 'redeemed': return <FiShoppingBag className="w-4 h-4" />;
      case 'exchanged': return <FiRefreshCw className="w-4 h-4" />;
      case 'pending': return <FiAlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex justify-center items-start">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row">
        
        {/* Left column - Image */}
        <div className="relative md:w-5/12 h-[250px] md:h-auto overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
          <img
            src={reward.image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-black/30" />
        </div>

        {/* Right column - Content */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor()}`}> 
                {getStatusIcon()} 
                {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
              </span>
              
              {isOwner && (
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/rewards/${id}/edit`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                    <FiEdit2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all">
                    <FiTrash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {reward.title}
            </h1>

            {/* Owner Info & Trust Rating */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-lg">
                {reward.owner.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-xs text-gray-400">Owner</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  {reward.owner.name}
                </span>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FiUserCheck className="w-3.5 h-3.5 text-cyan-500" /> Trust Score
                </span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {reward.owner.trustScore ?? 100}%
                </span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              {reward.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/10 rounded-2xl border border-cyan-100/50 dark:border-cyan-900/30 flex items-center gap-3">
                <FiShoppingBag className="w-6 h-6 text-cyan-500" />
                <div>
                  <p className="text-xs text-gray-400">Valuation</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-white">{reward.points} pts</p>
                </div>
              </div>
              
              <div className="p-4 bg-red-50/30 dark:bg-red-950/10 rounded-2xl border border-red-100/20 dark:border-red-900/20 flex items-center gap-3">
                <FiCalendar className="w-6 h-6 text-red-500 dark:text-red-400" />
                <div>
                  <p className="text-xs text-gray-400">Expiry Date</p>
                  <p className="font-bold text-sm text-gray-800 dark:text-white">
                    {new Date(reward.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Code unlock */}
            {reward.code && (
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <FiTag className="w-4 h-4" /> Reward Code Unlocked!
                </p>
                <code className="font-mono bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-950 px-4 py-2.5 rounded-xl block text-center text-lg font-bold text-gray-800 dark:text-white tracking-widest uppercase select-all shadow-inner">
                  {reward.code}
                </code>
              </div>
            )}
          </div>

          {/* Call to Actions */}
          {!isOwner && reward.status === 'available' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleRedeem}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <FiShoppingBag className="w-5 h-5" /> Redeem with Points
              </button>
              
              <button
                onClick={handleOpenSwapModal}
                className="flex-1 bg-white dark:bg-gray-900 hover:bg-gray-50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white py-3.5 rounded-2xl font-bold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-5 h-5 text-cyan-500 animate-pulse" /> Offer Exchange Swap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Overlay Slide-Up Swap Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700/50 relative overflow-hidden animate-slideUp">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiRefreshCw className="text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Propose Reward Swap</span>
              </h2>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendSwapOffer} className="space-y-5">
              
              {/* Select own reward */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <FiTag className="text-cyan-500" /> Select One of Your Available Rewards to Swap
                </label>
                {myAvailableRewards.length > 0 ? (
                  <select
                    value={selectedRewardId}
                    onChange={(e) => setSelectedRewardId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  >
                    <option value="">-- Propose Points-Only Offer (Or select a Reward) --</option>
                    {myAvailableRewards.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title} ({r.points} pts)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs font-medium">
                    You have no active rewards listed to swap. You can still offer points compensation!
                  </div>
                )}
              </div>

              {/* Point compensation input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <FiAward className="text-amber-500" /> Point Offset Compensation (Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 150 (Offer extra points to sweeten the deal)"
                    value={offeredPoints}
                    onChange={(e) => setOfferedPoints(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    reX pts
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Your current balance: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{user?.points} pts</span>
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <FiMessageSquare className="text-cyan-500" /> Pitch Your Proposal
                </label>
                <textarea
                  placeholder="Tell the owner why this swap is amazing..."
                  value={swapMessage}
                  onChange={(e) => setSwapMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSwap}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-3 rounded-2xl font-bold shadow-md shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {submittingSwap ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
                  <span>Propose Deal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rewardApi } from '../services/api';
import { FiEdit2, FiTrash2, FiLoader, FiCheck, FiAlertCircle, FiCalendar, FiTag, FiShoppingBag, FiPlusCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { PageLayout } from '../components/PageLayout';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { toast } from 'react-hot-toast';
import { FloatingActionButton } from '../components/FloatingActionButton';

interface Reward {
  _id: string;
  title: string;
  description: string;
  points: number;
  status: 'available' | 'redeemed' | 'exchanged';
  image_url: string;
  expiryDate: string;
}

export const MyRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const navigate = useNavigate();

  const fetchMyRewards = async () => {
    try {
      const response = await rewardApi.getMyRewards();
      const rewardsData = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRewards(rewardsData);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      toast.error('Failed to load your rewards');
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rewardId: string) => {
    try {
      await rewardApi.delete(rewardId);
      toast.success('Reward deleted successfully');
      fetchMyRewards();
    } catch (err) {
      console.error('Error deleting reward:', err);
      toast.error('Failed to delete reward');
    }
  };

  useEffect(() => {
    fetchMyRewards();
  }, []);

  if (loading) {
    return (
      <PageLayout title="My Rewards">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(null).map((_, i) => (
            <SkeletonLoader key={i} />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (rewards.length === 0) {
    return (
      <PageLayout title="My Rewards">
        <div className="col-span-full flex justify-center items-center min-h-[50vh]">
          <EmptyState />
        </div>
        <FloatingActionButton
          onClick={() => navigate('/rewards/create')}
          Icon={FiPlusCircle}
          label="Create Reward"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Rewards">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((reward) => (
          <div key={reward._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
              {/* Image */}
              <div className="relative h-[180px] overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img
                  src={reward.image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'}
                  alt={reward.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2">{reward.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{reward.description}</p>

                <div className="flex items-center gap-2 text-sm">
                  <FiShoppingBag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-white">{reward.points} Points</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Expires: {new Date(reward.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate(`/rewards/${reward._id}`)}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(reward._id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors ml-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {rewards.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700/60 pt-6 mt-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-800 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-semibold text-gray-800 dark:text-white">
              {Math.min(currentPage * itemsPerPage, rewards.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-800 dark:text-white">{rewards.length}</span> rewards
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.ceil(rewards.length / itemsPerPage) }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                  currentPage === pageNum
                    ? 'bg-cyan-500 border-transparent text-white shadow-md shadow-cyan-500/20'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(rewards.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(rewards.length / itemsPerPage)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <FloatingActionButton
        onClick={() => navigate('/rewards/create')}
        Icon={FiPlusCircle}
        label="Create Reward"
      />
    </PageLayout>
  );
};

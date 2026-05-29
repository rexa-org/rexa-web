import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';
import { PageLayout } from '../components/PageLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import {
  FiUsers, FiGift, FiFileText, FiTrendingUp, FiSliders,
  FiTrash2, FiSearch, FiAlertTriangle, FiArrowUpRight, FiArrowDownLeft,
  FiCheck, FiRefreshCw, FiDollarSign, FiShield, FiChevronLeft, FiChevronRight, FiX
} from 'react-icons/fi';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  trustScore?: number;
  lifetimeEarned?: number;
  lifetimeSpent?: number;
  createdAt: string;
}

interface RewardItem {
  _id: string;
  title: string;
  points: number;
  status: 'available' | 'pending' | 'redeemed';
  owner?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface TransactionItem {
  _id: string;
  fromUser?: { _id: string; name: string; email: string };
  toUser?: { _id: string; name: string; email: string };
  points: number;
  reward?: { _id: string; title: string; points: number };
  type: 'redemption' | 'exchange' | 'checkin' | 'signup_bonus' | 'admin_adjustment';
  createdAt: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'rewards' | 'transactions'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);
  
  // Point adjustment modal state
  const [adjustingUser, setAdjustingUser] = useState<UserItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, rewardsRes, txRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getRewards(),
        adminApi.getTransactions()
      ]);
      setUsers(usersRes.data || []);
      setRewards(rewardsRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      toast.error(err.response?.data?.message || 'Failed to load administrative logs');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    const amount = Number(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid non-zero points adjustment.');
      return;
    }

    try {
      setAdjusting(true);
      await adminApi.adjustPoints(adjustingUser._id, amount);
      toast.success(`Successfully adjusted points by ${amount} for ${adjustingUser.name}`);
      setAdjustingUser(null);
      setAdjustAmount('');
      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to adjust points:', err);
      toast.error(err.response?.data?.message || 'Failed to adjust points');
    } finally {
      setAdjusting(false);
    }
  };

  const handleDeleteReward = async (rewardId: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete the reward "${title}"? This overrides standard owner checks.`);
    if (!confirmDelete) return;

    try {
      await adminApi.deleteReward(rewardId);
      toast.success(`Reward "${title}" has been deleted.`);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to delete reward:', err);
      toast.error(err.response?.data?.message || 'Failed to delete reward listing');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <PageLayout title="Access Denied">
        <div className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-950/20 rounded-3xl p-8 shadow-md text-center max-w-md mx-auto my-12">
          <FiAlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4 animate-pulse" />
          <h3 className="text-xl font-extrabold text-gray-800 dark:text-white">Admin Access Only</h3>
          <p className="text-sm text-gray-400 mt-2">
            You do not have the required administrative permissions to access this control center.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) return <LoadingSpinner />;

  // Calculate high-level stats
  const totalVolume = transactions.reduce((acc, tx) => acc + Math.abs(tx.points), 0);

  // Search filter
  const filteredUsers = users.filter(
    u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRewards = rewards.filter(
    r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    t => (t.fromUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         (t.toUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         (t.reward?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout title="Admin Control Room">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiUsers className="w-6 h-6 text-cyan-500 mb-2" />
          <p className="text-xs font-semibold text-gray-400">Total Users</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{users.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiGift className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-xs font-semibold text-gray-400">Total Rewards</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{rewards.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiFileText className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-xs font-semibold text-gray-400">Transactions Logged</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{transactions.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50">
          <FiDollarSign className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-xs font-semibold text-gray-400">System Points Transferred</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{totalVolume}</p>
        </div>
      </div>

      {/* Tabs and Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-max">
          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FiUsers /> Users
          </button>
          <button
            onClick={() => { setActiveTab('rewards'); setSearchTerm(''); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeTab === 'rewards'
                ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FiGift /> Rewards
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setSearchTerm(''); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FiFileText /> Transactions
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-700 dark:text-gray-100 transition-all"
          />
        </div>
      </div>

      {/* Main content table depending on active tab */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/30 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Trust rating</th>
                  <th className="px-6 py-4">Lifetime earnings</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 dark:text-white">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          item.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{item.points} pts</td>
                      <td className="px-6 py-4 flex items-center gap-1 mt-3">
                        <FiShield className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{item.trustScore ?? 100}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 block">Earned: {item.lifetimeEarned ?? 100}</span>
                        <span className="text-xs text-gray-400 block">Spent: {item.lifetimeSpent ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setAdjustingUser(item)}
                          className="p-2 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 rounded-xl transition-all"
                          title="Adjust Points Balance"
                        >
                          <FiSliders className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/30 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                  <th className="px-6 py-4">Reward listing</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
                {filteredRewards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No rewards found</td>
                  </tr>
                ) : (
                  filteredRewards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                      <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{item.owner?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{item.owner?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-400">{item.points} pts</td>
                      <td className="px-6 py-4 capitalize">{item.category?.name || 'General'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                          item.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          item.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-750 dark:text-gray-450'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteReward(item._id, item.title)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                          title="Delete Listing"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/30 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Receiver</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No transactions recorded</td>
                  </tr>
                ) : (
                  filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 dark:text-white capitalize">
                          {item.type.replace('_', ' ')}
                        </div>
                        {item.reward && (
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">
                            Reward: {item.reward.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold capitalize">
                        <span className={`px-2 py-0.5 rounded ${
                          item.type === 'redemption' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400' :
                          item.type === 'exchange' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                          item.type === 'checkin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                          item.type === 'signup_bonus' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          {item.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {item.fromUser ? (
                          <>
                            <div className="font-semibold">{item.fromUser.name}</div>
                            <div className="text-gray-400">{item.fromUser.email}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {item.toUser ? (
                          <>
                            <div className="font-semibold">{item.toUser.name}</div>
                            <div className="text-gray-400">{item.toUser.email}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                        {item.points} pts
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 text-right">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Unified Pagination Footer */}
        {(() => {
          const listLength = 
            activeTab === 'users' ? filteredUsers.length :
            activeTab === 'rewards' ? filteredRewards.length :
            filteredTransactions.length;
          
          if (listLength <= itemsPerPage) return null;
          const totalPages = Math.ceil(listLength / itemsPerPage);

          return (
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/10 border-t border-gray-150 dark:border-gray-700/60 flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-800 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {Math.min(currentPage * itemsPerPage, listLength)}
                </span>{' '}
                of <span className="font-semibold text-gray-800 dark:text-white">{listLength}</span> records
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-250 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      currentPage === pageNum
                        ? 'bg-cyan-500 border-transparent text-white shadow-md shadow-cyan-500/20'
                        : 'bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 text-gray-750 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-250 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Adjust Points Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden transform scale-100 transition-all">
            <div className="p-6 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Adjust User Points</h3>
              <button
                onClick={() => setAdjustingUser(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdjustPointsSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Target User</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{adjustingUser.name}</p>
                <p className="text-xs text-gray-400">{adjustingUser.email}</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
                  Current Balance: {adjustingUser.points} pts
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="adjustAmount">
                  Points Adjustment Value
                </label>
                <input
                  type="number"
                  id="adjustAmount"
                  required
                  placeholder="e.g. 50 or -50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-gray-100"
                />
                <span className="text-[10px] text-gray-400 block mt-1.5">
                  Positive values credit user points. Negative values debit user points.
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl shadow-md shadow-cyan-500/15 flex items-center gap-1.5"
                >
                  {adjusting ? (
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FiCheck />
                  )}
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

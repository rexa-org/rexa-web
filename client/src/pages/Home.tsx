import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rewardApi, categoryApi } from '../services/api';
import { FiPlusCircle, FiCalendar, FiShoppingBag, FiSearch, FiSliders, FiGrid, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { PageLayout } from '../components/PageLayout';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { toast } from 'react-hot-toast';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { useAuth } from '../context/AuthContext';

interface Reward {
  _id: string;
  title: string;
  description: string;
  points: number;
  owner: { _id: string; name: string; email: string };
  status: 'available' | 'redeemed' | 'exchanged';
  expiryDate?: string;
  image_url: string;
  isActive?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export const Home = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, minPoints, maxPoints, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (minPoints) params.minPoints = Number(minPoints);
      if (maxPoints) params.maxPoints = Number(maxPoints);
      params.sort = sortBy;

      const response = await rewardApi.getAll(params);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
        
      // Filter out rewards owned by current user for the marketplace search results
      const filtered = data.filter((r: Reward) => {
        const notOwner = r.owner._id !== user?._id;
        const available = r.status === 'available';
        const notExpired = !r.expiryDate || new Date(r.expiryDate) > new Date();
        const active = r.isActive !== false;
        return notOwner && available && notExpired && active;
      });
      setRewards(filtered);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      toast.error('Failed to load rewards');
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRewards();
    }, 300); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, minPoints, maxPoints, sortBy, user?._id]);

  return (
    <PageLayout title="Reward Exchange Marketplace">
      
      {/* Search and Filters panel */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700/50 mb-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Main search bar */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search premium vouchers, coupons, gift cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex w-full md:w-auto gap-3">
            {/* Toggle filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-medium border border-gray-200 dark:border-gray-700 transition-all ${
                showFilters
                  ? 'bg-cyan-500 text-white border-transparent'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiSliders className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 md:w-48 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            >
              <option value="recent">Newest Listings</option>
              <option value="points_asc">Points: Low to High</option>
              <option value="points_desc">Points: High to Low</option>
            </select>
          </div>
        </div>

        {/* Collapsible advanced filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Points Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Min reX Points</label>
              <input
                type="number"
                placeholder="0"
                value={minPoints}
                onChange={(e) => setMinPoints(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>

            {/* Max Points Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Max reX Points</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(null).map((_, i) => <SkeletonLoader key={i} />)
        ) : rewards.length === 0 ? (
          <div className="col-span-full flex justify-center items-center min-h-[40vh]">
            <EmptyState />
          </div>
        ) : (
          rewards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(reward => (
            <div 
              key={reward._id} 
              onClick={() => navigate(`/rewards/${reward._id}`)}
              className="group bg-white dark:bg-gray-800 rounded-3xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col h-[400px]"
            >
              {/* Image & Badges */}
              <div className="relative h-[180px] overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                <img
                  src={reward.image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'}
                  alt={reward.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                
                {/* Category tag */}
                {(reward as any).category && (
                  <span className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-cyan-600 dark:text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {(reward as any).category.name}
                  </span>
                )}

                {/* Points Tag */}
                <span className="absolute bottom-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-2xl shadow-md">
                  {reward.points} Points
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {reward.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-xs">
                  {/* Owner */}
                  <div className="flex flex-col">
                    <span className="text-gray-400">Listed by</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {reward.owner.name}
                    </span>
                  </div>

                  {/* Expiry */}
                  {reward.expiryDate && (
                    <div className="flex flex-col text-right">
                      <span className="text-gray-400">Expires</span>
                      <span className="font-medium text-red-500 dark:text-red-400">
                        {new Date(reward.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && rewards.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700/60 pt-6 mt-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-800 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-semibold text-gray-800 dark:text-white">
              {Math.min(currentPage * itemsPerPage, rewards.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-800 dark:text-white">{rewards.length}</span> premium vouchers
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setCurrentPage(p => Math.max(p - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.ceil(rewards.length / itemsPerPage) }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
              onClick={() => {
                setCurrentPage(p => Math.min(p + 1, Math.ceil(rewards.length / itemsPerPage)));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === Math.ceil(rewards.length / itemsPerPage)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <FloatingActionButton
          onClick={() => navigate('/rewards/create')}
          Icon={FiPlusCircle}
          label="Create Reward"
        />
      )}
    </PageLayout>
  );
};

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rewardApi } from '../services/api';
import { FiCalendar, FiGift, FiHash, FiTag, FiAlertCircle, FiChevronLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Category {
    _id: string;
    name: string;
    icon: string;
}

export const EditReward = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        points: '',
        code: '',
        expiryDate: '',
        category: ''
    });

    const [categories] = useState<Category[]>([
        { _id: '507f1f77bcf86cd799439011', name: 'Gaming', icon: '🎮' },
        { _id: '507f1f77bcf86cd799439012', name: 'Shopping', icon: '🛍️' },
        { _id: '507f1f77bcf86cd799439013', name: 'Entertainment', icon: '🎬' },
        { _id: '507f1f77bcf86cd799439014', name: 'Food & Drinks', icon: '🍽️' },
        { _id: '507f1f77bcf86cd799439015', name: 'Travel', icon: '✈️' },
    ]);

    useEffect(() => {
        fetchReward();
    }, [id]);

    const fetchReward = async () => {
        try {
            setFetching(true);
            const response = await rewardApi.getById(id!);
            const reward = response.data;
            setForm({
                title: reward.title,
                description: reward.description,
                points: reward.points.toString(),
                code: reward.code || '',
                expiryDate: reward.expiryDate ? new Date(reward.expiryDate).toISOString().split('T')[0] : '',
                category: reward.category?._id || ''
            });
        } catch (error) {
            toast.error('Failed to fetch reward');
            navigate('/my-rewards');
        } finally {
            setFetching(false);
        }
    };

    const validateForm = () => {
        if (!form.title.trim()) return 'Title is required';
        if (!form.description.trim()) return 'Description is required';
        if (!form.points) return 'Points are required';
        if (Number(form.points) <= 0) return 'Points must be greater than 0';
        if (!form.code.trim()) return 'Voucher code is required';
        if (!form.expiryDate) return 'Expiry date is required';
        if (new Date(form.expiryDate) < new Date()) return 'Expiry date must be in the future';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await rewardApi.update(id!, {
                title: form.title.trim(),
                description: form.description.trim(),
                points: Number(form.points),
                code: form.code.trim().toUpperCase(),
                expiryDate: form.expiryDate,
                category: form.category || undefined
            });

            toast.success('Reward updated successfully!');
            navigate('/my-rewards');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update reward';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">Retrieving Listing Metadata...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20 text-slate-800 dark:text-slate-100 flex justify-center items-start">
            <div className="max-w-2xl w-full">
                
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 mb-6 transition"
                >
                    <FiChevronLeft className="w-4 h-4" />
                    Back to previous screen
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-850"
                >
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Edit Reward Listing
                            </h2>
                            <p className="text-slate-500 dark:text-slate-450 text-xs font-medium mt-0.5">
                                Modify active voucher parameters and valuation rules
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                            <FiGift className="w-5 h-5" />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-450 text-sm font-semibold">
                            <FiAlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">
                                Title / Name
                            </label>
                            <div className="relative">
                                <FiGift className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all"
                                    placeholder="e.g. Amazon $50 Voucher"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">
                                Description
                            </label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all h-28 resize-none"
                                placeholder="Details about how to claim, restrictions, or brand details..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">
                                    Points Required
                                </label>
                                <div className="relative">
                                    <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        value={form.points}
                                        onChange={e => setForm({ ...form, points: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all"
                                        placeholder="Points value"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2">
                                    Category
                                </label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-500 outline-none text-slate-900 dark:text-white text-sm transition-all"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.icon} {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2 flex items-center gap-1.5">
                                <FiTag className="text-cyan-500" /> Secure Voucher Code
                            </label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-500 outline-none font-mono font-bold text-slate-900 dark:text-white text-sm uppercase transition-all"
                                placeholder="VOUCHER-CODE-HEX"
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                <FiInfo /> Code remains encrypted until a swap transaction takes place.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase text-slate-450 tracking-wider mb-2 flex items-center gap-1.5">
                                <FiCalendar className="text-rose-500" /> Expiry Date
                            </label>
                            <input
                                type="date"
                                value={form.expiryDate}
                                onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-500 outline-none text-slate-900 dark:text-white text-sm transition-all"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/my-rewards')}
                                className="order-2 sm:order-1 w-full sm:w-1/3 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 font-bold hover:bg-slate-50 dark:hover:bg-slate-850 text-sm transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="order-1 sm:order-2 flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black text-sm transition shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Update Details
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};
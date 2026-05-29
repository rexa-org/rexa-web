import { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiEdit2, FiPlusCircle, FiSave, FiX, FiUser, FiMail, FiShield, FiStar, FiAward, FiBriefcase } from 'react-icons/fi';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    name: string;
    email: string;
    points: number;
    redeemedRewards: number;
    trustScore?: number;
    role?: 'user' | 'admin';
    createdAt?: string;
    ratingsCount?: number;
    ratingsSum?: number;
}

export const Profile = () => {
    const { user, fetchProfile: updateAuthProfile } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            if (response.data) {
                setProfile(response.data);
                setEditedProfile(response.data);
                setError('');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to load profile';
            setError(errorMessage);
            if (localStorage.getItem('token')) {
                console.error('Profile fetch error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedProfile) return;
        
        try {
            setUpdateLoading(true);
            setError('');
            
            const response = await authApi.updateProfile({
                name: editedProfile.name,
                email: editedProfile.email
            });

            if (response.data) {
                setProfile(response.data);
                setEditedProfile(response.data);
                setIsEditing(false);
                toast.success('Profile updated successfully');
                await updateAuthProfile(); // sync auth state
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-red-150 max-w-sm">
                    <p className="text-red-500 font-bold mb-2">Error</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'Profile details could not be found'}</p>
                </div>
            </div>
        );
    }

    const trustScore = profile.trustScore ?? 100;
    const averageRating = profile.ratingsCount && profile.ratingsCount > 0
        ? (profile.ratingsSum || 0) / profile.ratingsCount
        : 5.0;

    return (
        <div className="min-h-[85vh] p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-gray-900/10">
            <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 relative">
                
                {/* Visual Cover Banner */}
                <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-500 relative" />

                {/* Edit Toggle Button */}
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-36 right-6 p-2.5 text-gray-500 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition border border-gray-150 dark:border-gray-700/50 bg-white dark:bg-gray-800 shadow-sm"
                        title="Edit Profile"
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </button>
                )}

                {/* Profile Header Avatar */}
                <div className="relative px-6 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6">
                    <div className="w-28 h-28 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-3xl p-1 shadow-lg mx-auto sm:mx-0 bg-white dark:bg-gray-800">
                        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold font-mono">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <div className="flex-1 mt-2 sm:mt-0 text-center sm:text-left space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            profile.role === 'admin' ? 'bg-red-150 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400'
                        }`}>
                            <FiShield className="w-3 h-3" />
                            {profile.role || 'Swapper'}
                        </span>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                            {profile.name}
                        </h1>
                        <p className="text-sm text-gray-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                            <FiMail className="w-3.5 h-3.5" />
                            {profile.email}
                        </p>
                    </div>
                </div>

                {/* Form or Info fields */}
                <div className="px-6 pb-8 border-t border-gray-50 dark:border-gray-700/40 pt-6">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editedProfile?.name || ''}
                                        onChange={handleNameChange}
                                        className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                        Email Address (Locked)
                                    </label>
                                    <input
                                        type="email"
                                        value={editedProfile?.email || ''}
                                        disabled
                                        className="w-full px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-2xl text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3.5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedProfile(profile);
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
                                >
                                    {updateLoading ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                    ) : (
                                        <FiSave />
                                    )}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Profile Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-750">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Balance</span>
                                        <FiAward className="text-cyan-500" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{profile.points} pts</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-750">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Redeemed</span>
                                        <FiPlusCircle className="text-indigo-500" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{profile.redeemedRewards} rewards</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-750">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trust rating</span>
                                        <FiShield className="text-emerald-500" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{trustScore}%</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-750">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reputation</span>
                                        <FiStar className="text-amber-500 fill-current" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{averageRating.toFixed(1)}/5</p>
                                </div>
                            </div>

                            {/* Trust Rating Gauge card */}
                            <div className="bg-slate-50/50 dark:bg-slate-900/10 p-6 rounded-3xl border border-slate-150/40 dark:border-slate-750">
                                <h3 className="font-extrabold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 mb-2">
                                    <FiShield className="text-cyan-500" /> Trust Verification System
                                </h3>
                                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                    Your trust rating represents peer exchange rating feedback and account behavior. Keeping a score above 90% qualifies you for zero-cooldown transfers.
                                </p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                        <span>Peer Swapper Integrity</span>
                                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{trustScore}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-750 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700" 
                                            style={{ width: `${trustScore}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <FloatingActionButton
                onClick={() => navigate('/rewards/create')}
                Icon={FiPlusCircle}
                label="Create Reward"
            />
        </div>
    );
};
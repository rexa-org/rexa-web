import axios from 'axios';
import { CONFIG } from '../config/config';

// Create and export the base api instance
export const api = axios.create({
    baseURL: CONFIG.API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add Authorization token dynamically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authApi = {
    signin: (credentials: { email: string; password: string }) => 
        api.post('/auth/login', credentials),
    register: (userData: { name: string; email: string; password: string }) => 
        api.post('/auth/register', userData),
    verifyOtp: (data: { userId: string; otp: string }) => 
        api.post('/auth/verify-otp', data),
    resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
    checkin: () => api.post('/auth/checkin')
};

// Reward API endpoints
export const rewardApi = {
    getAll: (params?: any) => api.get('/rewards', { params }),
    getById: (id: string) => api.get(`/rewards/${id}`),
    create: (data: any) => api.post('/rewards', data),
    update: (id: string, data: any) => api.put(`/rewards/${id}`, data),
    delete: (id: string) => api.delete(`/rewards/${id}`),
    getMyRewards: () => api.get('/rewards/user/my-rewards')
};

// Add interfaces for type safety
interface Transaction {
  id: string;
  rewardId: string;
  date: string;
  // add other transaction properties as needed
}

// Transaction API endpoints
export const transactionApi = {
    getHistory: () => api.get<Transaction[]>('/transactions/history'),
    redeemReward: (rewardId: string) => api.post<Transaction>(`/transactions/redeem/${rewardId}`)
};

// Category API endpoints
export const categoryApi = {
    getAll: () => api.get('/categories'),
    getRewardsByCategory: (slug: string) => api.get(`/categories/${slug}/rewards`),
    create: (data: any) => api.post('/categories', data)
};

// Request API endpoints
export const requestApi = {
    create: (rewardId: string, data?: { offeredRewardId?: string; offeredPoints?: number; message?: string }) => 
        api.post(`/requests/${rewardId}`, data),
    getMyRequests: () => api.get('/requests/my-requests'),
    getById: (id: string) => api.get(`/requests/${id}`),
    respond: (id: string, response: string) => api.patch(`/requests/${id}/respond`, { response })
};

// Admin API endpoints
export const adminApi = {
    getUsers: () => api.get('/admin/users'),
    getRewards: () => api.get('/admin/rewards'),
    getTransactions: () => api.get('/admin/transactions'),
    adjustPoints: (userId: string, points: number) => api.post(`/admin/users/${userId}/points`, { points }),
    deleteReward: (rewardId: string) => api.delete(`/admin/rewards/${rewardId}`)
};
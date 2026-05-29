import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authApi } from '../services/api';

export interface User {
    _id: string;
    name: string;
    email: string;
    points: number;
    role: 'user' | 'admin';
    trustScore: number;
    ratingsCount: number;
    ratingsSum: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
    lastCheckIn?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updatePoints: (points: number) => void;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('token');
    });
    const [isLoading, setIsLoading] = useState(true);

    const setAuthToken = (token: string | null) => {
        if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authApi.signin({ email, password });
        const { token } = response.data;
        setAuthToken(token);
        await fetchProfile();
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            setAuthToken(token);
            const response = await authApi.getProfile();
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            if (localStorage.getItem('token')) {
                console.error('Failed to load profile:', error);
            }
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const updatePoints = (points: number) => {
        setUser(prev => prev ? { ...prev, points } : null);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updatePoints,
        fetchProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
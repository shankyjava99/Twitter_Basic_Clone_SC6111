import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set up axios defaults
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/api/auth/verify');
                    if (response.data.success) {
                        setUser(response.data.user);
                    } else {
                        localStorage.removeItem('token');
                        delete axios.defaults.headers.common['Authorization'];
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
                return { success: true };
            } else {
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/register', { username, password });
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
                return { success: true };
            } else {
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const walletLogin = async (account, signature) => {
        // For now, we'll just simulate wallet login
        // In a real implementation, you'd verify the signature on the backend
        try {
            // Create a mock user for wallet login
            const mockUser = {
                id: Date.now(),
                username: `wallet_${account.slice(0, 8)}`
            };

            // Generate a mock token (in real app, verify signature on backend)
            const mockToken = 'wallet_token_' + Date.now();
            localStorage.setItem('token', mockToken);
            setUser(mockUser);

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Wallet login failed' };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        walletLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

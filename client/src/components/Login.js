import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { Mail, Lock, Wallet, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from './Footer';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isWalletLoading, setIsWalletLoading] = useState(false);

    const { login, walletLogin } = useAuth();
    const { connectWallet, signMessage, isConnected, account } = useWallet();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        const result = await login(formData.username, formData.password);
        setIsLoading(false);

        if (result.success) {
            toast.success('Login successful!');
            navigate('/');
        } else {
            toast.error(result.error || 'Login failed');
        }
    };

    const handleWalletLogin = async () => {
        console.log('Starting wallet login process...');

        if (!isConnected) {
            console.log('Wallet not connected, attempting to connect...');
            const result = await connectWallet();
            if (!result.success) {
                console.error('Wallet connection failed:', result.error);
                return;
            }
            console.log('Wallet connected successfully');
        }

        setIsWalletLoading(true);
        try {
            console.log('Signing message for authentication...');
            // Sign a message for authentication
            const message = `Login to Twitter Clone at ${new Date().toISOString()}`;
            const signature = await signMessage(message);
            console.log('Message signed successfully');

            console.log('Sending wallet login request to backend...');
            const result = await walletLogin(account, signature);
            console.log('Wallet login result:', result);

            if (result.success) {
                console.log('Wallet login successful, navigating to home...');
                navigate('/');
            } else {
                console.error('Wallet login failed:', result.error);
            }
        } catch (error) {
            console.error('Wallet login error:', error);
            toast.error(`Wallet login failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsWalletLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-icon">𝕏</span>
                        <h1>Welcome back</h1>
                    </div>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            <Mail size={16} />
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${errors.username ? 'error' : ''}`}
                            placeholder="Enter your username"
                        />
                        {errors.username && (
                            <div className="form-error">{errors.username}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            <Lock size={16} />
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <div className="form-error">{errors.password}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <button
                    onClick={handleWalletLogin}
                    disabled={isWalletLoading}
                    className="btn btn-wallet w-full"
                >
                    <Wallet size={16} />
                    {isWalletLoading ? 'Connecting...' : 'Connect with MetaMask'}
                </button>

                <div className="wallet-note">
                    <small>⚠️ Only MetaMask wallet is supported. Please disable other wallets like Phantom.</small>
                </div>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>

                <div className="auth-back">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;

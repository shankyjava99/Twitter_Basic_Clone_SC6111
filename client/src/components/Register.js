import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { Mail, Lock, Wallet, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from './Footer';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isWalletLoading, setIsWalletLoading] = useState(false);

    const { register, walletLogin } = useAuth();
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
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        const result = await register(formData.username, formData.password);
        setIsLoading(false);

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    const handleWalletLogin = async () => {
        console.log('Starting wallet registration process...');

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
            const message = `Register to Twitter Clone at ${new Date().toISOString()}`;
            const signature = await signMessage(message);
            console.log('Message signed successfully');

            console.log('Sending wallet registration request to backend...');
            const result = await walletLogin(account, signature);
            console.log('Wallet registration result:', result);

            if (result.success) {
                console.log('Wallet registration successful, navigating to home...');
                toast.success('Account created with wallet!');
                navigate('/');
            } else {
                console.error('Wallet registration failed:', result.error);
            }
        } catch (error) {
            console.error('Wallet registration error:', error);
            toast.error(`Wallet registration failed: ${error.message || 'Unknown error'}`);
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
                        <h1>Join Twitter Clone</h1>
                    </div>
                    <p className="auth-subtitle">Create your account today</p>
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
                            placeholder="Choose a username"
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
                            placeholder="Create a password"
                        />
                        {errors.password && (
                            <div className="form-error">{errors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            <Lock size={16} />
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && (
                            <div className="form-error">{errors.confirmPassword}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
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
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
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

export default Register;

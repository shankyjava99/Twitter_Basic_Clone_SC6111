import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostForm from './PostForm';
import PostList from './PostList';

const Home = () => {
    const { user, logout } = useAuth();
    const { disconnectWallet, isConnected } = useWallet();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('/api/posts/all');
            if (response.data.success) {
                setPosts(response.data.posts);
            }
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        if (isConnected) {
            disconnectWallet();
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    if (loading) {
        return (
            <div className="loading">
                Loading posts...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">𝕏</span>
                        <span>Twitter Clone</span>
                    </div>

                    <div className="user-info">
                        <span className="username">
                            {user?.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {/* Post Form */}
                <PostForm onPostCreated={handlePostCreated} />

                {/* Posts Feed */}
                <PostList posts={posts} onPostsUpdated={fetchPosts} />
            </main>
        </div>
    );
};

export default Home;

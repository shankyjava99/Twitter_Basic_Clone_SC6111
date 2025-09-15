import React, { useState } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PostForm = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Please write something before posting');
            return;
        }

        if (content.length > 280) {
            toast.error('Post must be 280 characters or less');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/api/posts/create', { content });
            if (response.data.success) {
                setContent('');
                onPostCreated(response.data.post);
                toast.success('Post created successfully!');
            } else {
                toast.error(response.data.message || 'Failed to create post');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };

    const getCharCountColor = () => {
        if (content.length > 260) return 'error';
        if (content.length > 240) return 'warning';
        return '';
    };

    return (
        <form onSubmit={handleSubmit} className="post-form">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="post-input"
                rows="3"
                maxLength="280"
                disabled={isLoading}
            />

            <div className="post-actions">
                <div className={`char-count ${getCharCountColor()}`}>
                    {content.length}/280
                </div>

                <button
                    type="submit"
                    disabled={!content.trim() || isLoading || content.length > 280}
                    className="btn btn-primary"
                >
                    <Send size={16} />
                    {isLoading ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
};

export default PostForm;

import React from 'react';
import { Clock } from 'lucide-react';

const PostList = ({ posts, onPostsUpdated }) => {
    const formatTime = (timestamp) => {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - postTime) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d`;
        }
    };

    if (posts.length === 0) {
        return (
            <div className="text-center mt-2">
                <p style={{ color: '#71767b' }}>No posts yet. Be the first to post!</p>
            </div>
        );
    }

    return (
        <div className="posts-container">
            {posts.map((post) => (
                <div key={post.id} className="post">
                    <div className="post-header">
                        <span className="post-username">@{post.username}</span>
                        <span className="post-time">
                            <Clock size={12} />
                            {formatTime(post.created_at)}
                        </span>
                    </div>
                    <div className="post-content">
                        {post.content}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostList;

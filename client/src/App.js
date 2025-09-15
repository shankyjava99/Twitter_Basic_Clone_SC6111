import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return user ? <Navigate to="/" /> : children;
};

function App() {
    return (
        <AuthProvider>
            <WalletProvider>
                <Router>
                    <div className="App">
                        <Toaster position="top-right" />
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />
                        </Routes>
                    </div>
                </Router>
            </WalletProvider>
        </AuthProvider>
    );
}

export default App;

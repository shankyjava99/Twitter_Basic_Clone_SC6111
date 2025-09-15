import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        if (typeof window.ethereum === 'undefined') {
            return false;
        }

        // Check if it's specifically MetaMask
        if (window.ethereum.isMetaMask) {
            return true;
        }

        // Check if it's Phantom or other wallets
        if (window.ethereum.isPhantom || window.ethereum.isCoinbaseWallet || window.ethereum.isBraveWallet) {
            return false;
        }

        // If we can't determine, assume it might be MetaMask
        return true;
    };

    // Connect to MetaMask
    const connectWallet = async () => {
        console.log('Checking if MetaMask is installed...');
        if (!isMetaMaskInstalled()) {
            // Check if Phantom is detected
            if (window.ethereum && window.ethereum.isPhantom) {
                console.log('Phantom wallet detected');
                toast.error('Phantom wallet detected. Please install and use MetaMask instead.');
                return { success: false, error: 'Phantom wallet detected' };
            }

            console.log('No wallet detected');
            toast.error('MetaMask is not installed. Please install MetaMask to continue.');
            return { success: false, error: 'MetaMask not installed' };
        }

        console.log('MetaMask detected, attempting to connect...');
        try {
            // Check if we're already connected to MetaMask
            if (!window.ethereum.isMetaMask) {
                if (window.ethereum.isPhantom) {
                    console.log('Phantom wallet detected during connection');
                    toast.error('Phantom wallet detected. Please switch to MetaMask.');
                } else {
                    console.log('Non-MetaMask wallet detected');
                    toast.error('Please use MetaMask wallet. Other wallets are not supported.');
                }
                return { success: false, error: 'Not MetaMask wallet' };
            }

            console.log('Requesting account access...');
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            console.log('Accounts received:', accounts);
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const account = accounts[0];
            console.log('Selected account:', account);

            console.log('Creating provider and signer...');
            // Create provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            console.log('Setting wallet state...');
            setAccount(account);
            setProvider(provider);
            setSigner(signer);
            setIsConnected(true);

            console.log('Wallet connected successfully');
            toast.success('Wallet connected successfully!');
            return { success: true, account };
        } catch (error) {
            console.error('Wallet connection error:', error);
            const message = error.message || 'Failed to connect wallet';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Disconnect wallet
    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setIsConnected(false);
        toast.success('Wallet disconnected');
    };

    // Sign a message
    const signMessage = async (message) => {
        if (!signer) {
            throw new Error('Wallet not connected');
        }

        try {
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Message signing error:', error);
            throw error;
        }
    };

    // Initiate a transaction to a specific address
    const sendTransaction = async (toAddress, value = '0', data = '0x') => {
        if (!signer) {
            throw new Error('Wallet not connected');
        }

        try {
            // Validate address
            if (!ethers.isAddress(toAddress)) {
                throw new Error('Invalid recipient address');
            }

            // Prepare transaction
            const transaction = {
                to: toAddress,
                value: ethers.parseEther(value),
                data: data
            };

            // Send transaction
            const tx = await signer.sendTransaction(transaction);

            toast.success(`Transaction sent! Hash: ${tx.hash}`);
            return { success: true, hash: tx.hash };
        } catch (error) {
            console.error('Transaction error:', error);
            const message = error.message || 'Transaction failed';
            toast.error(message);
            throw error;
        }
    };

    // Get wallet balance
    const getBalance = async () => {
        if (!provider || !account) {
            return '0';
        }

        try {
            const balance = await provider.getBalance(account);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Balance fetch error:', error);
            return '0';
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (isMetaMaskInstalled() && window.ethereum.isMetaMask) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else if (accounts[0] !== account) {
                    setAccount(accounts[0]);
                    toast.info('Account changed');
                }
            };

            const handleChainChanged = (chainId) => {
                toast.info(`Network changed to chain ID: ${chainId}`);
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [account]);

    // Check if already connected on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (isMetaMaskInstalled()) {
                try {
                    const accounts = await window.ethereum.request({
                        method: 'eth_accounts'
                    });

                    if (accounts.length > 0 && window.ethereum.isMetaMask) {
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await provider.getSigner();

                        setAccount(accounts[0]);
                        setProvider(provider);
                        setSigner(signer);
                        setIsConnected(true);
                    }
                } catch (error) {
                    console.error('Connection check error:', error);
                }
            }
        };

        checkConnection();
    }, []);

    const value = {
        isConnected,
        account,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        signMessage,
        sendTransaction,
        getBalance,
        isMetaMaskInstalled
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

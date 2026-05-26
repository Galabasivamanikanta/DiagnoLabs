import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to set Auth Header for all Axios requests
    const setAuthHeader = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    useEffect(() => {
        // Check local storage for user info and token on load
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setAuthHeader(token);

            // Sync with backend to get latest details
            // Note: Now we have the token set in headers, so this call should work
            axios.get(`${API_BASE_URL}/api/auth/users`)
                .then(res => {
                    const latest = res.data.find(u => u._id === parsedUser._id);
                    if (latest) {
                        setUser(latest);
                        localStorage.setItem('user', JSON.stringify(latest));
                    }
                })
                .catch(err => {
                    console.error("Profile sync failed - User may not be authorized to view All Users", err);
                    // Standard fallback: If we can't sync via /users, just keep looking
                });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const { accessToken, ...userData } = res.data;
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', accessToken);
            setAuthHeader(accessToken);
            
            return { success: true, user: userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Login Failed" };
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/google`, { token: idToken });
            const { accessToken, ...userData } = res.data;
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', accessToken);
            setAuthHeader(accessToken);
            
            return { success: true, user: userData };
        } catch (err) {
            console.error("Google login failed", err);
            return { success: false, message: "Google Authentication failed" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAuthHeader(null);
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
            return { success: true, data: res.data };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Registration failed" };
        }
    };

    const deleteAccount = async () => {
        if (!user) return { success: false, message: "No user logged in" };
        try {
            await axios.delete(`${API_BASE_URL}/api/auth/${user._id}`);
            logout();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Deletion failed" };
        }
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, logout, register, loading, updateUser, deleteAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};


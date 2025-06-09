// client/src/auth/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('https://my-backend-ea4o-5f26miis2-shrunkhala345s-projects.vercel.app/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return res.data;
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post('https://my-backend-ea4o-5f26miis2-shrunkhala345s-projects.vercel.app/api/auth/register', { username, email, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return res.data;
        } catch (error) {
            console.error('Register error:', error.response?.data?.message || error.message);
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
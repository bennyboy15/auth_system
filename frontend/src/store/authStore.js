import { create } from "zustand";
import axios from "axios"

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";
axios.defaults.withCredentials = true; // Puts cookies into request header

export const useAuthStore = create((set) => ({
    user:null,
    isAuthenticated:false,
    error:null,
    isLoading: false,
    isCheckingAuth:false,
    message:null,

    signup: async function (email, password, name) {
        set({isLoading:true, error:null});
        try {
            const res = await axios.post(`${API_URL}/signup`, {name,email,password});
            set({user:res.data.user, isAuthenticated:true, error:null});
        } catch (error) {
            set({ error: error.response.data.message || "Error signing up"});
			throw error;
        } finally {
            set({isLoading:false});
        }
    },

    login: async function (email, password) {
        set({isLoading:true, error:null});
        try {
            const res = await axios.post(`${API_URL}/login`, {email,password});
            set({user:res.data.user, isAuthenticated:true, error:null});
        } catch (error) {
            set({ error: error.response.data.message || "Error logging in"});
			throw error;
        } finally {
            set({isLoading:false});
        }
    },

    logout: async function () {
        set({isLoading:true, error:null});
        try {
            await axios.post(`${API_URL}/logout`);
            set({user:null, isAuthenticated:false});
        } catch (error) {
            set({ error: error.response.data.message || "Error logging out"});
			throw error;
        } finally {
            set({isLoading:false});
        }
    },

    verifyEmail: async function (code) {
        set({isLoading:true, error:null});
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {code});
            set({user:response.data.user, isAuthenticated:true, error:null});
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error verifying email"});
			throw error;
        } finally {
            set({isLoading:false});
        }
    },

    checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},

    forgotPassword: async function (email) {
        set({isLoading:true, error:null, message:null});
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, {email});
            set({message:response.data.message,  error:null});
        } catch (error) {
            set({ error: error.response.data.message || "Error in forgot password authStore"});
			throw error;
        } finally {
            set({isLoading:false});
        }
    },

    resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},

}))
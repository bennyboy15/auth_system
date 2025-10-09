import { create } from "zustand";
import axios from "axios"

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

export const useAuthStore = create((set) => ({
    user:null,
    isAuthenticated:false,
    error:null,
    isLoading: false,
    isCheckingAuth:false,
    message:null,

    signup: async function (name, email, password) {
        set({isLoading:true, error:null});
        try {
            const res = await axios.post(`${API_URL}/signup`, {name,email,password});
            set({user:res.data.user, isAuthenticated:true});
        } catch (error) {
            set({ error: error.response.data.message || "Error signing up"});
			throw error;
        } finally {
            set({isLoading:false});
        }
    }

}))
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// axios 
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/messages`,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    if (typeof window !== 'undefined') {
        const adminViewData = sessionStorage.getItem('admin_viewing_school');
        if (adminViewData) {
            try {
                const { id } = JSON.parse(adminViewData);
                if (config.method?.toLowerCase() === 'get' || config.method?.toLowerCase() === 'delete') {
                    config.params = { ...config.params, school_id: id };
                } else if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
                    config.params = { ...config.params, school_id: id };
                    if (config.data && typeof config.data === 'object') {
                        config.data = { ...config.data, school_id: id };
                    }
                }
            } catch (e) {
                console.error('Error parsing admin view data:', e);
            }
        }
    }
    return config;
});


//   TYPES


export interface MessagePayload {
    message: string;
    sender_role: "teacher" | "supervisor" | "chief_supervisor" | "president";
}

export interface Message {
    id: number;
    sender_id: number;
    sender_name: string;
    sender_role: string;
    message: string;
    created_at: string;
}



const createMessage = async (data: MessagePayload) => {
    const res = await axiosGlobal.post("/", data);
    return res.data;
};



const getMessages = async (skip = 0, limit = 100) => {
    const res = await axiosGlobal.get("/", {
        params: { skip, limit },
    });
    return res.data;
};



const getRecentMessages = async (limit = 50) => {
    const res = await axiosGlobal.get("/recent", {
        params: { limit },
    });
    return res.data;
};



const deleteMessage = async (messageId: number) => {
    const res = await axiosGlobal.delete(`/${messageId}`);
    return res.data;
};



const messagesAPI = {
    createMessage,
    getMessages,
    getRecentMessages,
    deleteMessage,
};

export default messagesAPI;
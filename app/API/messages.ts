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
    return config;
});


//   TYPES


export interface MessagePayload {
    message: string;
    sender_role: "teacher" | "supervisor" | "president";
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
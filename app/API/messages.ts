import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type { MessageResponse } from "@/types/message";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://6d87-105-99-72-20.ngrok-free.app/api/v1";

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
                    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
                    if (config.data && typeof config.data === 'object' && !isFormData) {
                        config.data = { ...config.data, school_id: id };
                    }
                }
            } catch (e) {
                console.error('Error parsing admin view data:', e);
            }
        }
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        config.headers.delete('Content-Type');
    }

    return config;
});


//   TYPES


export interface MessagePayload {
    message: string;
    sender_role: "teacher" | "supervisor" | "chief_supervisor" | "president" | "student" | "guardian" | "admin";
}

export type Message = MessageResponse;



const createMessage = async (data: MessagePayload) => {
    const res = await axiosGlobal.post("/", data);
    return res.data;
};

const createMessageWithAttachments = async (
    data: FormData,
    onUploadProgress?: (progress: number) => void,
): Promise<MessageResponse> => {
    const res = await axiosGlobal.post<MessageResponse>("/with-attachments", data, {
        onUploadProgress: (event) => {
            if (event.total) {
                onUploadProgress?.(Math.round((event.loaded / event.total) * 100));
            }
        },
    });
    return res.data;
};

const getAttachment = async (attachmentId: number): Promise<Blob> => {
    const res = await axiosGlobal.get<Blob>(`/attachments/${attachmentId}`, {
        responseType: "blob",
    });
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
    createMessageWithAttachments,
    getAttachment,
    getMessages,
    getRecentMessages,
    deleteMessage,
};

export default messagesAPI;
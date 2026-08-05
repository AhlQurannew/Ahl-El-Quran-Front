import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

// axios 
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/api/v1/messages`,
    headers: {
        "Content-Type": "application/json",
    },
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
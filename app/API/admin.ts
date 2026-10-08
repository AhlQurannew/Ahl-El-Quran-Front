import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// axios
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/admin`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


const getPendingPresidents = async () => {
    const res = await axiosGlobal.get("/pending-presidents");
    return res.data;
};


const approvePresident = async (user_id: number) => {
    const res = await axiosGlobal.post(`/approve-president/${user_id}`);
    return res.data;
};


const rejectPresident = async (user_id: number) => {
    const res = await axiosGlobal.delete(`/reject-president/${user_id}`);
    return res.data;
};


const getAllUsers = async () => {
    const res = await axiosGlobal.get("/all-users");
    return res.data;
};


const deactivateUser = async (user_id: number) => {
    const res = await axiosGlobal.patch(`/deactivate-user/${user_id}`);
    return res.data;
};



const adminAPI = {
    getPendingPresidents,
    approvePresident,
    rejectPresident,
    getAllUsers,
    deactivateUser
};

export default adminAPI;
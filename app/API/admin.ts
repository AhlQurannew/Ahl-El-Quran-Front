import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// axios
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/admin`,
    headers: {
        "Content-Type": "application/json",
    },
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
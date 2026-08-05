import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// axios 
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/supervisor`,
    headers: {
        "Content-Type": "application/json",
    },
});


// TYPES



export interface SupervisorPayload {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}


export interface Supervisor {
    id: number;
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    is_active: boolean;
    created_at: string;
}


export interface SupervisorListResponse {
    supervisors: Supervisor[];
    total: number;
}



const createSupervisor = async (data: SupervisorPayload): Promise<Supervisor> => {
    const res = await axiosGlobal.post("/", data);
    return res.data;
};


const getSupervisors = async (
    skip: number = 0,
    limit: number = 100
): Promise<SupervisorListResponse> => {
    const res = await axiosGlobal.get("/", {
        params: { skip, limit },
    });
    return res.data;
};


const getSupervisorById = async (supervisor_id: number): Promise<Supervisor> => {
    const res = await axiosGlobal.get(`/${supervisor_id}`);
    return res.data;
};

const updateSupervisor = async (
    supervisor_id: number,
    data: SupervisorPayload
): Promise<Supervisor> => {
    const res = await axiosGlobal.put(`/${supervisor_id}`, data);
    return res.data;
};


const deleteSupervisor = async (supervisor_id: number): Promise<void> => {
    await axiosGlobal.delete(`/${supervisor_id}`);
};


const supervisorAPI = {
    createSupervisor,
    getSupervisors,
    getSupervisorById,
    updateSupervisor,
    deleteSupervisor,
};

export default supervisorAPI;
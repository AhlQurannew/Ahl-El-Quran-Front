import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

// axios 
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/president`,
    headers: {
        "Content-Type": "application/json",
    },
});


// TYPES 

// Supervisor
export interface RegisterSupervisorPayload {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

// Teacher
export interface RegisterTeacherPayload {
    firstname: string;
    lastname: string;
    email: string;
    riwaya: string;
    password: string;
}

// Student
export interface RegisterStudentPayload {
    firstname: string;
    lastname: string;
    email: string;
    parent_name: string;
    parent_phone: string;
    guardian_email: string;
    golden: boolean;
    password: string;
}



const registerSupervisor = async (data: RegisterSupervisorPayload) => {
    const res = await axiosGlobal.post("/register_supervisor", data);
    return res.data;
};


const registerTeacher = async (data: RegisterTeacherPayload) => {
    const res = await axiosGlobal.post("/register_teacher", data);
    return res.data;
};


const registerStudent = async (data: RegisterStudentPayload) => {
    const res = await axiosGlobal.post("/register_student", data);
    return res.data;
};


const getTeachers = async () => {
    const res = await axiosGlobal.get("/teachers");
    return res.data;
};


const getStudents = async () => {
    const res = await axiosGlobal.get("/students");
    return res.data;
};




const presidentAPI = {
    registerSupervisor,
    registerTeacher,
    registerStudent,
    getTeachers,
    getStudents,
};

export default presidentAPI;
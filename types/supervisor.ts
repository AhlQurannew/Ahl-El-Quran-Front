export interface Supervisor {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface SupervisorList {
  supervisors: Supervisor[];
  total: number;
}

export interface SupervisorCreatePayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface SupervisorUpdatePayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

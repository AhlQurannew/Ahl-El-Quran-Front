export interface Supervisor {
  id: string; // Used internally for keys/references
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

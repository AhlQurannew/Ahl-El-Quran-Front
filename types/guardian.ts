export interface Guardian {
  id: string;
  guardianId: number | null;
  firstName: string | null;
  lastName: string | null;
  relationship: string | null;
  guardianContactId: number | null;
  guardianAccountId: number | null;
  homeAddress: string | null;
  job: string | null;
  profileImage: string | null;
  email: string | null;
}

export interface GuardianInfo {
  guardianId: Guardian[];
}

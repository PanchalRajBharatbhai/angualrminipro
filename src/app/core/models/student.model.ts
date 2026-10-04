export type StudentStatus = 'Active' | 'Inactive' | 'Suspended';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Student {
  id: string; // e.g., 'STU-1001'
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  profileImage?: string; // base64 or URL
  status: StudentStatus;
  createdAt: string; // ISO date string
}

export interface StudentFilter {
  search?: string;
  status?: StudentStatus | 'All';
  gender?: Gender | 'All';
}

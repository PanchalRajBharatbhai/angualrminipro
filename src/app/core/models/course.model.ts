export type CourseStatus = 'Active' | 'Upcoming' | 'Completed' | 'Inactive';

export interface Course {
  id: string; // e.g., 'CRS-201'
  name: string;
  code: string; // e.g., 'CS301'
  description: string;
  instructor: string;
  category: string; // e.g., 'Computer Science', 'Design', 'Data Science'
  duration: string; // e.g., '12 Weeks'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  capacity: number;
  availableSeats: number;
  fee: number;
  status: CourseStatus;
  createdAt: string;
}

export interface CourseFilter {
  search?: string;
  category?: string | 'All';
  status?: CourseStatus | 'All';
}

import { Course } from './course.model';
import { Student } from './student.model';

export type EnrollmentStatus = 'Active' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Waived';

export interface Enrollment {
  id: string; // e.g., 'ENR-5001'
  studentId: string;
  courseId: string;
  enrollmentDate: string; // YYYY-MM-DD
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  grade?: string; // e.g., 'A', 'B+', etc.
  createdAt: string;
}

export interface EnrollmentWithDetails extends Enrollment {
  student?: Student;
  course?: Course;
}

export interface EnrollmentFilter {
  search?: string;
  courseId?: string | 'All';
  studentId?: string | 'All';
  status?: EnrollmentStatus | 'All';
  paymentStatus?: PaymentStatus | 'All';
}

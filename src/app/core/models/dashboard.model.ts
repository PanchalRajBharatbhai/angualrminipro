import { Course } from './course.model';
import { EnrollmentWithDetails } from './enrollment.model';

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  activeCourses: number;
  availableSeats: number;
  totalCapacity: number;
  capacityUtilization: number; // percentage (0 - 100)
  recentEnrollments: EnrollmentWithDetails[];
  popularCourses: { course: Course; enrollmentCount: number }[];
  statusBreakdown: {
    active: number;
    completed: number;
    cancelled: number;
  };
}

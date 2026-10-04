import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardStats } from '../models/dashboard.model';
import { StudentService } from './student.service';
import { CourseService } from './course.service';
import { EnrollmentService } from './enrollment.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService
  ) {}

  public getDashboardStats(): Observable<DashboardStats> {
    return combineLatest([
      this.studentService.getStudents(),
      this.courseService.getCourses(),
      this.enrollmentService.getEnrollments(),
    ]).pipe(
      map(([students, courses, enrollments]) => {
        const totalStudents = students.length;
        const totalCourses = courses.length;
        const totalEnrollments = enrollments.length;

        const activeCourses = courses.filter((c) => c.status === 'Active').length;
        const totalCapacity = courses.reduce((sum, c) => sum + c.capacity, 0);
        const availableSeats = courses.reduce(
          (sum, c) => sum + (c.status === 'Active' ? c.availableSeats : 0),
          0
        );

        const totalActiveEnrollments = enrollments.filter(
          (e) => e.status === 'Active'
        ).length;

        const capacityUtilization =
          totalCapacity > 0
            ? Math.round((totalActiveEnrollments / totalCapacity) * 100)
            : 0;

        // Recent 5 enrollments sorted by createdAt descending
        const recentEnrollments = [...enrollments]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        // Popular courses by enrollment count
        const courseCounts = courses.map((course) => {
          const count = enrollments.filter(
            (e) => e.courseId === course.id && e.status === 'Active'
          ).length;
          return { course, enrollmentCount: count };
        });

        courseCounts.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        const popularCourses = courseCounts.slice(0, 4);

        const statusBreakdown = {
          active: enrollments.filter((e) => e.status === 'Active').length,
          completed: enrollments.filter((e) => e.status === 'Completed').length,
          cancelled: enrollments.filter((e) => e.status === 'Cancelled').length,
        };

        return {
          totalStudents,
          totalCourses,
          totalEnrollments,
          activeCourses,
          availableSeats,
          totalCapacity,
          capacityUtilization,
          recentEnrollments,
          popularCourses,
          statusBreakdown,
        };
      })
    );
  }
}

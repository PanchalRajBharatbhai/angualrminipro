import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Enrollment,
  EnrollmentFilter,
  EnrollmentWithDetails,
} from '../models/enrollment.model';
import { StorageService } from './storage.service';
import { CourseService } from './course.service';
import { NotificationService } from './notification.service';
import { matchesEntityId } from '../utils/id-matcher.util';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private enrollmentsSubject: BehaviorSubject<Enrollment[]>;
  public enrollments$: Observable<Enrollment[]>;

  constructor(
    private storage: StorageService,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    const initialEnrollments = this.storage.getEnrollments();
    this.enrollmentsSubject = new BehaviorSubject<Enrollment[]>(
      initialEnrollments
    );
    this.enrollments$ = this.enrollmentsSubject.asObservable();
  }

  public getEnrollments(
    filter?: EnrollmentFilter
  ): Observable<EnrollmentWithDetails[]> {
    return this.enrollments$.pipe(
      map((enrollments) => {
        const students = this.storage.getStudents();
        const courses = this.storage.getCourses();

        // Populate relationships
        const enriched: EnrollmentWithDetails[] = enrollments.map((e) => ({
          ...e,
          student: students.find((s) => s.id === e.studentId),
          course: courses.find((c) => c.id === e.courseId),
        }));

        if (!filter) return enriched;

        return enriched.filter((item) => {
          let matches = true;

          if (filter.search && filter.search.trim()) {
            const term = filter.search.toLowerCase().trim();
            const termMatches =
              item.id.toLowerCase().includes(term) ||
              (item.student && item.student.name.toLowerCase().includes(term)) ||
              (item.student && item.student.email.toLowerCase().includes(term)) ||
              (item.course && item.course.name.toLowerCase().includes(term)) ||
              (item.course && item.course.code.toLowerCase().includes(term));
            if (!termMatches) matches = false;
          }

          if (filter.courseId && filter.courseId !== 'All') {
            if (item.courseId !== filter.courseId) matches = false;
          }

          if (filter.studentId && filter.studentId !== 'All') {
            if (item.studentId !== filter.studentId) matches = false;
          }

          if (filter.status && filter.status !== 'All') {
            if (item.status !== filter.status) matches = false;
          }

          if (filter.paymentStatus && filter.paymentStatus !== 'All') {
            if (item.paymentStatus !== filter.paymentStatus) matches = false;
          }

          return matches;
        });
      })
    );
  }

  public getEnrollmentById(
    id: string
  ): Observable<EnrollmentWithDetails | undefined> {
    return of(this.getEnrollmentByIdSync(id));
  }

  public getEnrollmentByIdSync(id: string): EnrollmentWithDetails | undefined {
    const e = this.enrollmentsSubject.value.find((item) => matchesEntityId(item.id, id));
    if (!e) return undefined;

    const students = this.storage.getStudents();
    const courses = this.storage.getCourses();

    return {
      ...e,
      student: students.find((s) => s.id === e.studentId),
      course: courses.find((c) => c.id === e.courseId),
    };
  }

  public getEnrollmentsByStudent(
    studentId: string
  ): Observable<EnrollmentWithDetails[]> {
    return this.getEnrollments().pipe(
      map((list) => list.filter((e) => matchesEntityId(e.studentId, studentId)))
    );
  }

  public getEnrollmentsByCourse(
    courseId: string
  ): Observable<EnrollmentWithDetails[]> {
    return this.getEnrollments().pipe(
      map((list) => list.filter((e) => matchesEntityId(e.courseId, courseId)))
    );
  }

  public createEnrollment(
    data: Omit<Enrollment, 'id' | 'createdAt'>
  ): Observable<Enrollment> {
    const students = this.storage.getStudents();
    const courses = this.storage.getCourses();
    const currentEnrollments = this.enrollmentsSubject.value;

    const student = students.find((s) => s.id === data.studentId);
    if (!student) {
      this.notificationService.error('Error', 'Selected student does not exist.');
      return throwError(() => new Error('Selected student does not exist.'));
    }

    const course = courses.find((c) => c.id === data.courseId);
    if (!course) {
      this.notificationService.error('Error', 'Selected course does not exist.');
      return throwError(() => new Error('Selected course does not exist.'));
    }

    // Business Rule 1: Course status must accept enrollments
    if (course.status === 'Inactive') {
      this.notificationService.error(
        'Enrollment Rejected',
        `Course "${course.name}" is currently Inactive and cannot accept enrollments.`
      );
      return throwError(() => new Error('Course is inactive.'));
    }
    if (course.status === 'Completed') {
      this.notificationService.error(
        'Enrollment Rejected',
        `Course "${course.name}" is already Completed.`
      );
      return throwError(() => new Error('Course is completed.'));
    }

    // Business Rule 2: Course must have seats available if status is Active
    if (data.status === 'Active' && course.availableSeats <= 0) {
      this.notificationService.error(
        'Course Full',
        `Course "${course.name}" is fully booked (${course.capacity}/${course.capacity} seats taken).`
      );
      return throwError(() => new Error('Course is full.'));
    }

    // Business Rule 3: Prevent duplicate active enrollment for same student in same course
    const duplicate = currentEnrollments.find(
      (e) =>
        e.studentId === data.studentId &&
        e.courseId === data.courseId &&
        e.status === 'Active'
    );
    if (duplicate && data.status === 'Active') {
      this.notificationService.warning(
        'Duplicate Enrollment',
        `${student.name} is already actively enrolled in "${course.name}".`
      );
      return throwError(
        () =>
          new Error(
            `${student.name} is already actively enrolled in this course.`
          )
      );
    }

    // Generate unique ID: ENR-50XX
    const highestIdNum = currentEnrollments.reduce((max, e) => {
      const match = e.id.match(/ENR-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 5000);

    const newId = `ENR-${highestIdNum + 1}`;
    const newEnrollment: Enrollment = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEnrollment, ...currentEnrollments];
    this.storage.saveEnrollments(updated);
    this.enrollmentsSubject.next(updated);
    this.courseService.refresh();

    this.notificationService.success(
      'Enrollment Confirmed',
      `${student.name} enrolled in "${course.name}" (${newEnrollment.id}).`
    );

    return of(newEnrollment);
  }

  public updateEnrollment(
    id: string,
    updates: Partial<Omit<Enrollment, 'id' | 'createdAt'>>
  ): Observable<Enrollment> {
    const currentEnrollments = this.enrollmentsSubject.value;
    const index = currentEnrollments.findIndex((e) => matchesEntityId(e.id, id));

    if (index === -1) {
      this.notificationService.error('Error', `Enrollment with ID ${id} not found.`);
      return throwError(() => new Error(`Enrollment with ID ${id} not found.`));
    }

    const oldEnrollment = currentEnrollments[index];
    const newStudentId = updates.studentId || oldEnrollment.studentId;
    const newCourseId = updates.courseId || oldEnrollment.courseId;
    const newStatus = updates.status || oldEnrollment.status;

    // Check duplicate if course, student, or status changed to Active
    if (newStatus === 'Active') {
      const duplicate = currentEnrollments.find(
        (e) =>
          e.id !== id &&
          e.studentId === newStudentId &&
          e.courseId === newCourseId &&
          e.status === 'Active'
      );
      if (duplicate) {
        this.notificationService.warning(
          'Duplicate Enrollment',
          'This student is already actively enrolled in the selected course.'
        );
        return throwError(
          () =>
            new Error(
              'This student is already actively enrolled in the selected course.'
            )
        );
      }
    }

    const updatedEnrollment: Enrollment = {
      ...oldEnrollment,
      ...updates,
    };

    const updatedList = [...currentEnrollments];
    updatedList[index] = updatedEnrollment;

    this.storage.saveEnrollments(updatedList);
    this.enrollmentsSubject.next(updatedList);
    this.courseService.refresh();

    this.notificationService.success(
      'Enrollment Updated',
      `Enrollment ${updatedEnrollment.id} was successfully modified.`
    );

    return of(updatedEnrollment);
  }

  public cancelEnrollment(id: string): Observable<Enrollment> {
    return this.updateEnrollment(id, { status: 'Cancelled' });
  }

  public deleteEnrollment(id: string): Observable<boolean> {
    const currentEnrollments = this.enrollmentsSubject.value;
    const enrollment = currentEnrollments.find((e) => matchesEntityId(e.id, id));

    if (!enrollment) {
      this.notificationService.error('Error', `Enrollment with ID ${id} not found.`);
      return throwError(() => new Error(`Enrollment with ID ${id} not found.`));
    }

    const updated = currentEnrollments.filter((e) => !matchesEntityId(e.id, id));
    this.storage.saveEnrollments(updated);
    this.enrollmentsSubject.next(updated);
    this.courseService.refresh();

    this.notificationService.success(
      'Enrollment Deleted',
      `Enrollment ${id} was deleted.`
    );

    return of(true);
  }

  public refresh(): void {
    const list = this.storage.getEnrollments();
    this.enrollmentsSubject.next(list);
  }
}

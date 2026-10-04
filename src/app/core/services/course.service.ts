import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course, CourseFilter } from '../models/course.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { matchesEntityId } from '../utils/id-matcher.util';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private coursesSubject: BehaviorSubject<Course[]>;
  public courses$: Observable<Course[]>;

  constructor(
    private storage: StorageService,
    private notificationService: NotificationService
  ) {
    const initialCourses = this.storage.getCourses();
    this.coursesSubject = new BehaviorSubject<Course[]>(initialCourses);
    this.courses$ = this.coursesSubject.asObservable();
  }

  public getCourses(filter?: CourseFilter): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses) => {
        if (!filter) return courses;

        return courses.filter((c) => {
          let matches = true;

          if (filter.search && filter.search.trim()) {
            const term = filter.search.toLowerCase().trim();
            const termMatches =
              c.name.toLowerCase().includes(term) ||
              c.code.toLowerCase().includes(term) ||
              c.instructor.toLowerCase().includes(term) ||
              c.category.toLowerCase().includes(term);
            if (!termMatches) matches = false;
          }

          if (filter.category && filter.category !== 'All') {
            if (c.category !== filter.category) matches = false;
          }

          if (filter.status && filter.status !== 'All') {
            if (c.status !== filter.status) matches = false;
          }

          return matches;
        });
      })
    );
  }

  public getCourseById(id: string): Observable<Course | undefined> {
    const course = this.coursesSubject.value.find(
      (c) => matchesEntityId(c.id, id) || matchesEntityId(c.code, id)
    );
    return of(course);
  }

  public createCourse(
    courseData: Omit<Course, 'id' | 'createdAt' | 'availableSeats'>
  ): Observable<Course> {
    const currentCourses = this.coursesSubject.value;

    // Check duplicate code
    const duplicateCode = currentCourses.find(
      (c) => c.code.toLowerCase() === courseData.code.toLowerCase().trim()
    );
    if (duplicateCode) {
      this.notificationService.error(
        'Duplicate Course Code',
        `Course code ${courseData.code} is already assigned to another course.`
      );
      return throwError(
        () => new Error(`Course code ${courseData.code} already exists.`)
      );
    }

    const highestIdNum = currentCourses.reduce((max, c) => {
      const match = c.id.match(/CRS-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 200);

    const newId = `CRS-${highestIdNum + 1}`;
    const newCourse: Course = {
      ...courseData,
      id: newId,
      availableSeats: courseData.capacity, // Initially empty, all capacity is available
      createdAt: new Date().toISOString(),
    };

    const updated = [newCourse, ...currentCourses];
    this.storage.saveCourses(updated);
    this.coursesSubject.next(updated);

    this.notificationService.success(
      'Course Created',
      `Course "${newCourse.name}" (${newCourse.code}) created successfully.`
    );

    return of(newCourse);
  }

  public updateCourse(
    id: string,
    updates: Partial<Omit<Course, 'id' | 'createdAt'>>
  ): Observable<Course> {
    const currentCourses = this.coursesSubject.value;
    const index = currentCourses.findIndex(
      (c) => matchesEntityId(c.id, id) || matchesEntityId(c.code, id)
    );

    if (index === -1) {
      this.notificationService.error('Error', `Course with ID ${id} not found.`);
      return throwError(() => new Error(`Course with ID ${id} not found.`));
    }

    // Check code duplication
    if (updates.code) {
      const duplicateCode = currentCourses.find(
        (c) =>
          !matchesEntityId(c.id, id) &&
          !matchesEntityId(c.code, id) &&
          c.code.toLowerCase() === updates.code?.toLowerCase().trim()
      );
      if (duplicateCode) {
        this.notificationService.error(
          'Duplicate Course Code',
          `Course code ${updates.code} is already assigned.`
        );
        return throwError(
          () => new Error(`Course code ${updates.code} already exists.`)
        );
      }
    }

    const oldCourse = currentCourses[index];
    const newCapacity =
      updates.capacity !== undefined ? updates.capacity : oldCourse.capacity;

    // Count existing active enrollments to safely adjust availableSeats
    const enrollments = this.storage.getEnrollments();
    const activeEnrollments = enrollments.filter(
      (e) => e.courseId === id && e.status === 'Active'
    ).length;

    if (newCapacity < activeEnrollments) {
      this.notificationService.warning(
        'Capacity Warning',
        `New capacity (${newCapacity}) is less than current active enrollments (${activeEnrollments}).`
      );
    }

    const updatedAvailableSeats = Math.max(0, newCapacity - activeEnrollments);

    const updatedCourse: Course = {
      ...oldCourse,
      ...updates,
      availableSeats: updatedAvailableSeats,
    };

    const updatedList = [...currentCourses];
    updatedList[index] = updatedCourse;

    this.storage.saveCourses(updatedList);
    this.coursesSubject.next(updatedList);

    this.notificationService.success(
      'Course Updated',
      `Course "${updatedCourse.name}" was successfully updated.`
    );

    return of(updatedCourse);
  }

  public deleteCourse(id: string): Observable<boolean> {
    const currentCourses = this.coursesSubject.value;
    const course = currentCourses.find(
      (c) => matchesEntityId(c.id, id) || matchesEntityId(c.code, id)
    );

    if (!course) {
      this.notificationService.error('Error', `Course with ID ${id} not found.`);
      return throwError(() => new Error(`Course with ID ${id} not found.`));
    }

    // Check if course has active enrollments
    const enrollments = this.storage.getEnrollments();
    const activeEnrollments = enrollments.filter(
      (e) => e.courseId === id && e.status === 'Active'
    );
    if (activeEnrollments.length > 0) {
      this.notificationService.error(
        'Cannot Delete Course',
        `Course "${course.name}" has ${activeEnrollments.length} active enrollment(s). Please cancel or reassign them first.`
      );
      return throwError(
        () =>
          new Error(
            `Course "${course.name}" cannot be deleted because it has active enrollments.`
          )
      );
    }

    const updated = currentCourses.filter(
      (c) => !matchesEntityId(c.id, id) && !matchesEntityId(c.code, id)
    );
    this.storage.saveCourses(updated);
    this.coursesSubject.next(updated);

    this.notificationService.success(
      'Course Deleted',
      `Course "${course.name}" was removed.`
    );

    return of(true);
  }

  public refresh(): void {
    const list = this.storage.getCourses();
    this.coursesSubject.next(list);
  }
}

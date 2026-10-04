import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Student, StudentFilter } from '../models/student.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { matchesEntityId } from '../utils/id-matcher.util';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private studentsSubject: BehaviorSubject<Student[]>;
  public students$: Observable<Student[]>;

  constructor(
    private storage: StorageService,
    private notificationService: NotificationService
  ) {
    const initialStudents = this.storage.getStudents();
    this.studentsSubject = new BehaviorSubject<Student[]>(initialStudents);
    this.students$ = this.studentsSubject.asObservable();
  }

  public getStudents(filter?: StudentFilter): Observable<Student[]> {
    return this.students$.pipe(
      map((students) => {
        if (!filter) return students;

        return students.filter((s) => {
          let matches = true;

          if (filter.search && filter.search.trim()) {
            const term = filter.search.toLowerCase().trim();
            const termMatches =
              s.name.toLowerCase().includes(term) ||
              s.email.toLowerCase().includes(term) ||
              s.id.toLowerCase().includes(term) ||
              s.phone.includes(term);
            if (!termMatches) matches = false;
          }

          if (filter.status && filter.status !== 'All') {
            if (s.status !== filter.status) matches = false;
          }

          if (filter.gender && filter.gender !== 'All') {
            if (s.gender !== filter.gender) matches = false;
          }

          return matches;
        });
      })
    );
  }

  public getStudentById(id: string): Observable<Student | undefined> {
    const student = this.studentsSubject.value.find((s) => matchesEntityId(s.id, id));
    return of(student);
  }

  public createStudent(
    studentData: Omit<Student, 'id' | 'createdAt'>
  ): Observable<Student> {
    const currentStudents = this.studentsSubject.value;

    // Check duplicate email
    const duplicate = currentStudents.find(
      (s) => s.email.toLowerCase() === studentData.email.toLowerCase().trim()
    );
    if (duplicate) {
      this.notificationService.error(
        'Duplicate Email',
        `A student with email ${studentData.email} already exists.`
      );
      return throwError(
        () => new Error(`Student with email ${studentData.email} already exists.`)
      );
    }

    // Generate unique ID: STU-10XX
    const highestIdNum = currentStudents.reduce((max, s) => {
      const match = s.id.match(/STU-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);

    const newId = `STU-${highestIdNum + 1}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newStudent, ...currentStudents];
    this.storage.saveStudents(updated);
    this.studentsSubject.next(updated);

    this.notificationService.success(
      'Student Created',
      `Student ${newStudent.name} (${newStudent.id}) was successfully added.`
    );

    return of(newStudent);
  }

  public updateStudent(
    id: string,
    updates: Partial<Omit<Student, 'id' | 'createdAt'>>
  ): Observable<Student> {
    const currentStudents = this.studentsSubject.value;
    const index = currentStudents.findIndex((s) => matchesEntityId(s.id, id));

    if (index === -1) {
      this.notificationService.error('Error', `Student with ID ${id} not found.`);
      return throwError(() => new Error(`Student with ID ${id} not found.`));
    }

    // Check duplicate email if email is being updated
    if (updates.email) {
      const duplicate = currentStudents.find(
        (s) =>
          !matchesEntityId(s.id, id) &&
          s.email.toLowerCase() === updates.email?.toLowerCase().trim()
      );
      if (duplicate) {
        this.notificationService.error(
          'Duplicate Email',
          `Another student with email ${updates.email} already exists.`
        );
        return throwError(
          () => new Error(`Another student with email ${updates.email} already exists.`)
        );
      }
    }

    const updatedStudent: Student = {
      ...currentStudents[index],
      ...updates,
    };

    const updatedList = [...currentStudents];
    updatedList[index] = updatedStudent;

    this.storage.saveStudents(updatedList);
    this.studentsSubject.next(updatedList);

    this.notificationService.success(
      'Student Updated',
      `Student ${updatedStudent.name} was successfully updated.`
    );

    return of(updatedStudent);
  }

  public deleteStudent(id: string): Observable<boolean> {
    const currentStudents = this.studentsSubject.value;
    const student = currentStudents.find((s) => matchesEntityId(s.id, id));

    if (!student) {
      this.notificationService.error('Error', `Student with ID ${id} not found.`);
      return throwError(() => new Error(`Student with ID ${id} not found.`));
    }

    const updated = currentStudents.filter((s) => !matchesEntityId(s.id, id));
    this.storage.saveStudents(updated);
    this.studentsSubject.next(updated);

    this.notificationService.success(
      'Student Deleted',
      `Student ${student.name} (${student.id}) was removed.`
    );

    return of(true);
  }

  public refresh(): void {
    const list = this.storage.getStudents();
    this.studentsSubject.next(list);
  }
}

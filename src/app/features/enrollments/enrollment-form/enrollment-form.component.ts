import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { StudentService } from '../../../core/services/student.service';
import { CourseService } from '../../../core/services/course.service';
import { Student } from '../../../core/models/student.model';
import { Course } from '../../../core/models/course.model';
import { EnrollmentWithDetails } from '../../../core/models/enrollment.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SeatAvailabilityPipe } from '../../../shared/pipes/seat-availability.pipe';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconComponent,
    StatusBadgeComponent,
    SeatAvailabilityPipe,
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/enrollments" class="btn-back">
          <app-icon name="arrow-left" [size]="16"></app-icon>
          <span>Back to Enrollments</span>
        </a>
        <div class="header-titles">
          <h2>{{ isEditMode ? 'Modify Enrollment Record' : 'Register New Course Enrollment' }}</h2>
          <p>{{ isEditMode ? 'Update tuition or course allocation details for ' + (existingEnrollment?.id || '') : 'Pair a verified student with an active course offering.' }}</p>
        </div>
      </div>

      <div class="card form-card">
        <form [formGroup]="enrollmentForm" (ngSubmit)="onSubmit()">
          <div class="form-section-title">Registration Mapping</div>

          <div class="form-grid">
            <!-- Student Selection -->
            <div class="form-group">
              <label for="studentId" class="form-label required">Select Student</label>
              <select
                id="studentId"
                formControlName="studentId"
                class="form-control"
                [class.is-invalid]="f['studentId'].touched && f['studentId'].invalid"
                (change)="onStudentOrCourseChange()"
              >
                <option value="">-- Choose a student --</option>
                @for (student of students; track student.id) {
                  <option [value]="student.id">
                    {{ student.name }} ({{ student.id }}) - {{ student.status }}
                  </option>
                }
              </select>
              @if (f['studentId'].touched && f['studentId'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Student selection is required</span>
                </div>
              }
            </div>

            <!-- Course Selection -->
            <div class="form-group">
              <label for="courseId" class="form-label required">Select Course</label>
              <select
                id="courseId"
                formControlName="courseId"
                class="form-control"
                [class.is-invalid]="f['courseId'].touched && f['courseId'].invalid"
                (change)="onStudentOrCourseChange()"
              >
                <option value="">-- Choose a course --</option>
                @for (course of courses; track course.id) {
                  <option [value]="course.id">
                    {{ course.code }} - {{ course.name }} ({{ course.availableSeats }} seats left)
                  </option>
                }
              </select>
              @if (f['courseId'].touched && f['courseId'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Course selection is required</span>
                </div>
              }
            </div>
          </div>

          <!-- Dynamic Live Course Snapshot Card -->
          @if (selectedCourse) {
            <div class="selected-course-card" [class.danger]="selectedCourse.availableSeats <= 0 || selectedCourse.status !== 'Active'">
              <div class="course-snapshot-header">
                <div>
                  <span class="mono-code">{{ selectedCourse.code }}</span>
                  <h4 class="mt-1">{{ selectedCourse.name }}</h4>
                  <span class="cell-sub">Faculty: {{ selectedCourse.instructor }} &bull; {{ selectedCourse.category }}</span>
                </div>
                <div class="header-badges">
                  <app-status-badge [status]="selectedCourse.status"></app-status-badge>
                </div>
              </div>

              <div class="course-snapshot-body">
                <div class="snapshot-item">
                  <span class="lbl">Seat Availability</span>
                  <span class="val font-semibold" [class.text-danger]="selectedCourse.availableSeats <= 0" [class.text-success]="selectedCourse.availableSeats > 0">
                    {{ selectedCourse.availableSeats | seatAvailability: selectedCourse.capacity }}
                  </span>
                </div>
                <div class="snapshot-item">
                  <span class="lbl">Standard Fee</span>
                  <span class="val">{{ selectedCourse.fee | currency: 'INR': 'symbol': '1.0-0' }}</span>
                </div>
                <div class="snapshot-item">
                  <span class="lbl">Duration</span>
                  <span class="val">{{ selectedCourse.duration }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Business Rule Validation Conflict Messages -->
          @if (conflictError) {
            <div class="conflict-alert" role="alert">
              <app-icon name="alert-triangle" [size]="18"></app-icon>
              <div class="conflict-text">
                <strong>Enrollment Constraint Violation</strong>
                <span>{{ conflictError }}</span>
              </div>
            </div>
          }

          <div class="divider"></div>

          <!-- Enrollment Details Section -->
          <div class="form-section-title">Schedule & Tuition Status</div>

          <div class="form-grid">
            <!-- Enrollment Date -->
            <div class="form-group">
              <label for="enrollmentDate" class="form-label required">Enrollment Date</label>
              <input
                id="enrollmentDate"
                type="date"
                formControlName="enrollmentDate"
                class="form-control"
                [class.is-invalid]="f['enrollmentDate'].touched && f['enrollmentDate'].invalid"
              />
              @if (f['enrollmentDate'].touched && f['enrollmentDate'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Enrollment date is required</span>
                </div>
              }
            </div>

            <!-- Status -->
            <div class="form-group">
              <label for="status" class="form-label required">Enrollment Status</label>
              <select
                id="status"
                formControlName="status"
                class="form-control"
                (change)="onStudentOrCourseChange()"
              >
                <option value="Active">Active (Attending)</option>
                <option value="Completed">Completed (Passed term)</option>
                <option value="Cancelled">Cancelled (Dropped)</option>
              </select>
            </div>

            <!-- Payment Status -->
            <div class="form-group">
              <label for="paymentStatus" class="form-label required">Tuition Payment Status</label>
              <select id="paymentStatus" formControlName="paymentStatus" class="form-control">
                <option value="Paid">Paid in Full</option>
                <option value="Pending">Payment Pending</option>
                <option value="Waived">Scholarship / Fee Waived</option>
              </select>
            </div>

            <!-- Grade (Optional) -->
            <div class="form-group">
              <label for="grade" class="form-label">Grade / Academic Assessment</label>
              <input
                id="grade"
                type="text"
                formControlName="grade"
                class="form-control"
                placeholder="e.g., A+, 85%, In Progress"
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group" style="margin-top: 1rem">
            <label for="notes" class="form-label">Administrative Notes & Remarks</label>
            <textarea
              id="notes"
              formControlName="notes"
              class="form-control"
              rows="3"
              placeholder="e.g., Special approval granted, installment timeline, prerequisites verified..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/enrollments" class="btn btn-outline">
              <span>Cancel</span>
            </a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isSubmitting || enrollmentForm.invalid || !!conflictError"
            >
              @if (isSubmitting) {
                <span class="btn-spinner"></span>
                <span>Saving Registration...</span>
              } @else {
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ isEditMode ? 'Update Enrollment' : 'Confirm Enrollment' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        max-width: 820px;
        margin: 0 auto;
      }

      .form-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--text-secondary);
        font-size: 0.8125rem;
        font-weight: 500;
        text-decoration: none;
        width: fit-content;
      }
      .btn-back:hover {
        color: var(--primary);
      }

      .header-titles h2 {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .header-titles p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 0.2rem;
      }

      .form-card {
        padding: 2rem;
      }

      .form-section-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 1.25rem;
      }

      .selected-course-card {
        margin: 1.25rem 0;
        padding: 1.25rem;
        background: var(--surface-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .selected-course-card.danger {
        background: var(--danger-light);
        border-color: var(--danger-border);
      }

      .course-snapshot-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .course-snapshot-header h4 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0.25rem 0 0.15rem;
      }

      .mono-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary);
      }

      .course-snapshot-body {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        padding-top: 0.875rem;
        border-top: 1px solid var(--border-subtle);
      }

      .snapshot-item {
        display: flex;
        flex-direction: column;
      }
      .snapshot-item .lbl {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .snapshot-item .val {
        font-size: 0.875rem;
        color: var(--text-primary);
        margin-top: 2px;
      }

      .conflict-alert {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1.125rem;
        border-radius: var(--radius-md);
        background: var(--danger-light);
        border: 1px solid var(--danger-border);
        color: var(--danger-text);
        margin: 1.25rem 0;
      }
      .conflict-text {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        line-height: 1.35;
      }

      .divider {
        height: 1px;
        background: var(--border);
        margin: 1.75rem 0;
      }

      .form-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.875rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
      }

      .btn-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }

      .text-danger { color: var(--danger); }
      .text-success { color: var(--success); }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        .form-grid > * {
          grid-column: 1 / -1 !important;
          width: 100% !important;
        }
        .course-snapshot-body {
          grid-template-columns: 1fr !important;
          gap: 0.75rem;
        }
      }

      @media (max-width: 640px) {
        .form-card {
          padding: 1.25rem 1rem !important;
        }
        .form-actions {
          flex-direction: column !important;
          gap: 0.75rem;
        }
        .form-actions button,
        .form-actions a {
          width: 100% !important;
        }
      }

      @media (max-width: 480px) {
        .form-card {
          padding: 1rem 0.75rem !important;
        }
      }
    `,
  ],
})
export class EnrollmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private enrollmentService = inject(EnrollmentService);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  enrollmentForm!: FormGroup;
  isEditMode = false;
  enrollmentId: string | null = null;
  existingEnrollment: EnrollmentWithDetails | null = null;
  isSubmitting = false;

  students: Student[] = [];
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  conflictError: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.enrollmentForm = this.fb.group({
      studentId: ['', Validators.required],
      courseId: ['', Validators.required],
      enrollmentDate: [today, Validators.required],
      status: ['Active', Validators.required],
      paymentStatus: ['Paid', Validators.required],
      grade: [''],
      notes: [''],
    });
  }

  get f() {
    return this.enrollmentForm.controls;
  }

  private loadDropdownData(): void {
    this.studentService.students$.subscribe((students) => {
      this.students = students;
      this.cdr.markForCheck();
    });

    this.courseService.courses$.subscribe((courses) => {
      this.courses = courses;

      // Handle queryParams pre-fill or edit load
      this.route.queryParams.subscribe((queryParams) => {
        if (queryParams['studentId']) {
          this.enrollmentForm.patchValue({ studentId: queryParams['studentId'] });
        }
        if (queryParams['courseId']) {
          this.enrollmentForm.patchValue({ courseId: queryParams['courseId'] });
        }
        this.onStudentOrCourseChange();
        this.cdr.markForCheck();
      });

      this.enrollmentId = this.route.snapshot.paramMap.get('id');
      if (this.enrollmentId) {
        this.isEditMode = true;
        this.loadExistingEnrollment(this.enrollmentId);
      }
      this.cdr.markForCheck();
    });
  }

  private loadExistingEnrollment(id: string): void {
    this.enrollmentService.getEnrollmentById(id).subscribe((enr) => {
      if (!enr) {
        this.router.navigate(['/enrollments']);
        return;
      }
      this.existingEnrollment = enr;
      this.enrollmentForm.patchValue({
        studentId: enr.studentId,
        courseId: enr.courseId,
        enrollmentDate: enr.enrollmentDate,
        status: enr.status,
        paymentStatus: enr.paymentStatus,
        grade: enr.grade || '',
        notes: enr.notes || '',
      });
      this.onStudentOrCourseChange();
      this.cdr.markForCheck();
    });
  }

  onStudentOrCourseChange(): void {
    const courseId = this.enrollmentForm.get('courseId')?.value;
    const studentId = this.enrollmentForm.get('studentId')?.value;
    const status = this.enrollmentForm.get('status')?.value;

    this.selectedCourse = this.courses.find((c) => c.id === courseId) || null;
    this.conflictError = null;

    if (!this.selectedCourse || !studentId) {
      this.cdr.markForCheck();
      return;
    }

    // Check course operational status
    if (this.selectedCourse.status === 'Inactive') {
      this.conflictError = `This course is marked as Inactive and cannot accept enrollments.`;
      this.cdr.markForCheck();
      return;
    }
    if (this.selectedCourse.status === 'Completed') {
      this.conflictError = `This course is marked as Completed and is closed for registration.`;
      this.cdr.markForCheck();
      return;
    }

    // Check seats available if enrolling as Active
    // (If in edit mode and the course hasn't changed, don't block itself)
    const isSameCourseInEdit =
      this.isEditMode && this.existingEnrollment?.courseId === courseId && this.existingEnrollment?.status === 'Active';

    if (status === 'Active' && !isSameCourseInEdit && this.selectedCourse.availableSeats <= 0) {
      this.conflictError = `This course has reached maximum capacity (${this.selectedCourse.capacity}/${this.selectedCourse.capacity} seats). No seats available.`;
      this.cdr.markForCheck();
      return;
    }

    // Check for duplicate active enrollment in same course
    if (status === 'Active') {
      this.enrollmentService.getEnrollments().subscribe((all) => {
        const isDuplicate = all.some(
          (e) =>
            e.id !== this.enrollmentId &&
            e.studentId === studentId &&
            e.courseId === courseId &&
            e.status === 'Active'
        );
        if (isDuplicate) {
          const student = this.students.find((s) => s.id === studentId);
          this.conflictError = `${student?.name || 'This student'} is already actively enrolled in "${this.selectedCourse?.name}".`;
        }
        this.cdr.markForCheck();
      });
    }
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid || this.conflictError) {
      this.enrollmentForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();
    const formValues = this.enrollmentForm.value;

    if (this.isEditMode && this.enrollmentId) {
      this.enrollmentService
        .updateEnrollment(this.enrollmentId, formValues)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/enrollments', this.enrollmentId]);
          },
          error: () => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      this.enrollmentService.createEnrollment(formValues).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.router.navigate(['/enrollments', created.id]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    }
  }
}

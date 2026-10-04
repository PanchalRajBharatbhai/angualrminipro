import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Custom validator ensuring endDate is not prior to startDate
 */
export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;

  if (start && end && new Date(start) > new Date(end)) {
    return { dateRangeInvalid: true };
  }
  return null;
};

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconComponent,
    AutoFocusDirective,
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/courses" class="btn-back">
          <app-icon name="arrow-left" [size]="16"></app-icon>
          <span>Back to Courses</span>
        </a>
        <div class="header-titles">
          <h2>{{ isEditMode ? 'Modify Course Syllabus' : 'Add New Course Offering' }}</h2>
          <p>{{ isEditMode ? 'Update curriculum specs, capacity, or instructor assignment for ' + (existingCourse?.name || '') : 'Define new curriculum module, credit requirements, and seat capacity.' }}</p>
        </div>
      </div>

      <div class="card form-card">
        <form [formGroup]="courseForm" (ngSubmit)="onSubmit()">
          <div class="form-section-title">Course Specifications</div>

          <div class="form-grid">
            <!-- Course Name -->
            <div class="form-group col-span-full">
              <label for="name" class="form-label required">Course Title</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="form-control"
                [class.is-invalid]="f['name'].touched && f['name'].invalid"
                placeholder="e.g., Cloud Architecture & Distributed Systems"
                appAutoFocus
              />
              @if (f['name'].touched && f['name'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Course title is required (minimum 3 characters)</span>
                </div>
              }
            </div>

            <!-- Course Code -->
            <div class="form-group">
              <label for="code" class="form-label required">Course Code</label>
              <input
                id="code"
                type="text"
                formControlName="code"
                class="form-control"
                [class.is-invalid]="f['code'].touched && f['code'].invalid"
                placeholder="e.g., CS-101 / IT-202"
              />
              @if (f['code'].touched && f['code'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Course code is required</span>
                </div>
              }
            </div>

            <!-- Category -->
            <div class="form-group">
              <label for="category" class="form-label required">Academic Category</label>
              <select
                id="category"
                formControlName="category"
                class="form-control"
                [class.is-invalid]="f['category'].touched && f['category'].invalid"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Design">Design</option>
                <option value="Security">Security</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <!-- Instructor -->
            <div class="form-group">
              <label for="instructor" class="form-label required">Faculty / Instructor</label>
              <input
                id="instructor"
                type="text"
                formControlName="instructor"
                class="form-control"
                [class.is-invalid]="f['instructor'].touched && f['instructor'].invalid"
                placeholder="e.g., Prof. Alex Smith / Dr. Jane Doe"
              />
              @if (f['instructor'].touched && f['instructor'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Instructor name is required</span>
                </div>
              }
            </div>

            <!-- Duration -->
            <div class="form-group">
              <label for="duration" class="form-label required">Course Duration</label>
              <input
                id="duration"
                type="text"
                formControlName="duration"
                class="form-control"
                [class.is-invalid]="f['duration'].touched && f['duration'].invalid"
                placeholder="e.g., 12 Weeks (or 1 Semester)"
              />
              @if (f['duration'].touched && f['duration'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Duration is required</span>
                </div>
              }
            </div>
          </div>

          <!-- Description -->
          <div class="form-group" style="margin-top: 1rem">
            <label for="description" class="form-label required">Curriculum Description</label>
            <textarea
              id="description"
              formControlName="description"
              class="form-control"
              rows="3"
              [class.is-invalid]="f['description'].touched && f['description'].invalid"
              placeholder="Provide curriculum highlights, prerequisites, and learning objectives..."
            ></textarea>
            @if (f['description'].touched && f['description'].invalid) {
              <div class="form-error">
                <app-icon name="alert-circle" [size]="12"></app-icon>
                <span>Description is required</span>
              </div>
            }
          </div>

          <div class="divider"></div>

          <!-- Schedule & Capacity Section -->
          <div class="form-section-title">Schedule, Capacity & Tuition</div>

          <div class="form-grid">
            <!-- Start Date -->
            <div class="form-group">
              <label for="startDate" class="form-label required">Course Start Date</label>
              <input
                id="startDate"
                type="date"
                formControlName="startDate"
                class="form-control"
                [class.is-invalid]="f['startDate'].touched && f['startDate'].invalid"
              />
            </div>

            <!-- End Date -->
            <div class="form-group">
              <label for="endDate" class="form-label required">Course End Date</label>
              <input
                id="endDate"
                type="date"
                formControlName="endDate"
                class="form-control"
                [class.is-invalid]="f['endDate'].touched && f['endDate'].invalid"
              />
            </div>
          </div>

          @if (courseForm.errors?.['dateRangeInvalid'] && (f['startDate'].touched || f['endDate'].touched)) {
            <div class="alert-box-warning">
              <app-icon name="alert-triangle" [size]="16"></app-icon>
              <span>Validation Warning: Course end date must be on or after the start date.</span>
            </div>
          }

          <div class="form-grid" style="margin-top: 1rem">
            <!-- Capacity -->
            <div class="form-group">
              <label for="capacity" class="form-label required">Maximum Seat Capacity</label>
              <input
                id="capacity"
                type="number"
                min="1"
                max="500"
                formControlName="capacity"
                class="form-control"
                [class.is-invalid]="f['capacity'].touched && f['capacity'].invalid"
                placeholder="e.g., 40"
              />
              @if (f['capacity'].touched && f['capacity'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Capacity must be greater than 0</span>
                </div>
              }
            </div>

            <!-- Tuition Fee -->
            <div class="form-group">
              <label for="fee" class="form-label required">Tuition Fee (₹)</label>
              <input
                id="fee"
                type="number"
                min="0"
                step="500"
                formControlName="fee"
                class="form-control"
                [class.is-invalid]="f['fee'].touched && f['fee'].invalid"
                placeholder="e.g., 15000"
              />
              @if (f['fee'].touched && f['fee'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Fee cannot be negative</span>
                </div>
              }
            </div>

            <!-- Status -->
            <div class="form-group col-span-full">
              <label for="status" class="form-label required">Offering Status</label>
              <select
                id="status"
                formControlName="status"
                class="form-control"
                [class.is-invalid]="f['status'].touched && f['status'].invalid"
              >
                <option value="Active">Active (Open for student registrations)</option>
                <option value="Upcoming">Upcoming (Scheduled for next term)</option>
                <option value="Completed">Completed (Past semester)</option>
                <option value="Inactive">Inactive (Suspended offering)</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/courses" class="btn btn-outline">
              <span>Cancel</span>
            </a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isSubmitting || courseForm.invalid"
            >
              @if (isSubmitting) {
                <span class="btn-spinner"></span>
                <span>Saving Course...</span>
              } @else {
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ isEditMode ? 'Update Course Offering' : 'Publish Course' }}</span>
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

      .divider {
        height: 1px;
        background: var(--border);
        margin: 1.75rem 0;
      }

      .alert-box-warning {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--warning-light);
        border: 1px solid var(--warning-border);
        color: var(--warning-text);
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        margin-top: 0.5rem;
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

      .col-span-full {
        grid-column: span 2;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        .form-grid > *,
        .col-span-full {
          grid-column: 1 / -1 !important;
          width: 100% !important;
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
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  courseForm!: FormGroup;
  isEditMode = false;
  courseId: string | null = null;
  existingCourse: Course | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
    this.courseId = this.route.snapshot.paramMap.get('id');

    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourseData(this.courseId);
    }
  }

  private initForm(): void {
    this.courseForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        code: ['', [Validators.required]],
        description: ['', [Validators.required, Validators.minLength(10)]],
        instructor: ['', [Validators.required]],
        category: ['Computer Science', Validators.required],
        duration: ['12 Weeks', Validators.required],
        startDate: ['2025-01-15', Validators.required],
        endDate: ['2025-04-20', Validators.required],
        capacity: [25, [Validators.required, Validators.min(1)]],
        fee: [12000, [Validators.required, Validators.min(0)]],
        status: ['Active', Validators.required],
      },
      { validators: dateRangeValidator }
    );
  }

  get f() {
    return this.courseForm.controls;
  }

  private loadCourseData(id: string): void {
    this.courseService.getCourseById(id).subscribe((course) => {
      if (!course) {
        this.notificationService.error(
          'Course Not Found',
          `No course exists for ID: ${id}`
        );
        this.router.navigate(['/courses']);
        return;
      }

      this.existingCourse = course;
      this.courseForm.patchValue({
        name: course.name,
        code: course.code,
        description: course.description,
        instructor: course.instructor,
        category: course.category,
        duration: course.duration,
        startDate: course.startDate,
        endDate: course.endDate,
        capacity: course.capacity,
        fee: course.fee,
        status: course.status,
      });
      this.cdr.markForCheck();
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();
    const formValues = this.courseForm.value;

    if (this.isEditMode && this.courseId) {
      this.courseService.updateCourse(this.courseId, formValues).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/courses', this.courseId]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.courseService.createCourse(formValues).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.router.navigate(['/courses', created.id]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    }
  }
}

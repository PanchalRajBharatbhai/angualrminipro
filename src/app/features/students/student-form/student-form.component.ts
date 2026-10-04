import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../core/models/student.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-student-form',
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
      <!-- Breadcrumb & Title -->
      <div class="form-header">
        <a routerLink="/students" class="btn-back">
          <app-icon name="arrow-left" [size]="16"></app-icon>
          <span>Back to Students</span>
        </a>
        <div class="header-titles">
          <h2>{{ isEditMode ? 'Edit Student Details' : 'Register New Student' }}</h2>
          <p>{{ isEditMode ? 'Update academic record and contact information for ' + (existingStudent?.name || '') : 'Enter student personal, contact, and enrollment profile.' }}</p>
        </div>
      </div>

      <div class="card form-card">
        <form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
          <!-- Profile Photo Section -->
          <div class="photo-section">
            <div class="avatar-preview-wrap">
              <img
                [src]="previewImage || defaultAvatar"
                alt="Profile Preview"
                class="avatar-preview"
                [class.has-image]="!!previewImage"
              />
              @if (previewImage) {
                <button
                  type="button"
                  class="btn-remove-photo"
                  (click)="removePhoto()"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <app-icon name="x" [size]="14"></app-icon>
                </button>
              }
            </div>

            <div class="photo-controls">
              <div class="photo-btn-row">
                <label class="btn btn-outline btn-sm upload-btn">
                  <app-icon name="upload" [size]="14"></app-icon>
                  <span>{{ previewImage ? 'Change Photo' : 'Upload Profile Photo' }}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    (change)="onFileSelected($event)"
                    style="display: none"
                  />
                </label>
                @if (previewImage) {
                  <span class="photo-ready-badge">
                    <app-icon name="check-circle" [size]="12"></app-icon>
                    <span>Photo Selected</span>
                  </span>
                }
              </div>
              <span class="photo-hint">Supported formats: JPG, PNG, WEBP (Max 2MB)</span>

              <!-- Preset Avatars for quick selection -->
              <div class="preset-avatars-row">
                <span class="preset-label">Or choose avatar:</span>
                <div class="preset-chips">
                  @for (preset of presetAvatars; track preset) {
                    <img
                      [src]="preset"
                      alt="Preset"
                      class="preset-thumb"
                      [class.active]="previewImage === preset"
                      (click)="selectPresetAvatar(preset)"
                      title="Select this profile photo"
                    />
                  }
                </div>
              </div>

              @if (imageError) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>{{ imageError }}</span>
                </div>
              }
            </div>
          </div>

          <div class="divider"></div>

          <!-- Basic Information -->
          <div class="form-section-title">Personal & Academic Information</div>
          <div class="form-grid">
            <!-- Full Name -->
            <div class="form-group">
              <label for="name" class="form-label required">Full Name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="form-control"
                [class.is-invalid]="f['name'].touched && f['name'].invalid"
                placeholder="e.g., Aarav Sharma"
                appAutoFocus
              />
              @if (f['name'].touched && f['name'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  @if (f['name'].errors?.['required']) {
                    <span>Student name is required</span>
                  } @else if (f['name'].errors?.['minlength']) {
                    <span>Name must be at least 3 characters</span>
                  }
                </div>
              }
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label required">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                [class.is-invalid]="f['email'].touched && f['email'].invalid"
                placeholder="e.g., student.name@university.edu"
              />
              @if (f['email'].touched && f['email'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  @if (f['email'].errors?.['required']) {
                    <span>Email is required</span>
                  } @else if (f['email'].errors?.['email']) {
                    <span>Enter a valid institutional email</span>
                  }
                </div>
              }
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label for="phone" class="form-label required">Contact Phone</label>
              <input
                id="phone"
                type="text"
                formControlName="phone"
                class="form-control"
                [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
                placeholder="e.g., +91 98765 43210"
              />
              @if (f['phone'].touched && f['phone'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Phone number is required</span>
                </div>
              }
            </div>

            <!-- Gender -->
            <div class="form-group">
              <label for="gender" class="form-label required">Gender</label>
              <select
                id="gender"
                formControlName="gender"
                class="form-control"
                [class.is-invalid]="f['gender'].touched && f['gender'].invalid"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Date of Birth -->
            <div class="form-group">
              <label for="dateOfBirth" class="form-label required">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                formControlName="dateOfBirth"
                class="form-control"
                [class.is-invalid]="f['dateOfBirth'].touched && f['dateOfBirth'].invalid"
              />
              @if (f['dateOfBirth'].touched && f['dateOfBirth'].invalid) {
                <div class="form-error">
                  <app-icon name="alert-circle" [size]="12"></app-icon>
                  <span>Valid date of birth is required</span>
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
                [class.is-invalid]="f['status'].touched && f['status'].invalid"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <!-- Residential Address -->
          <div class="form-group" style="margin-top: 1rem">
            <label for="address" class="form-label required">Residential Address</label>
            <textarea
              id="address"
              formControlName="address"
              class="form-control"
              rows="3"
              [class.is-invalid]="f['address'].touched && f['address'].invalid"
              placeholder="e.g., Room 204, Campus Hostel, University Residence, City"
            ></textarea>
            @if (f['address'].touched && f['address'].invalid) {
              <div class="form-error">
                <app-icon name="alert-circle" [size]="12"></app-icon>
                <span>Residential address is required</span>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/students" class="btn btn-outline">
              <span>Cancel</span>
            </a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isSubmitting || studentForm.invalid"
            >
              @if (isSubmitting) {
                <span class="btn-spinner"></span>
                <span>Saving Record...</span>
              } @else {
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ isEditMode ? 'Update Student Record' : 'Register Student' }}</span>
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

      .photo-section {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }

      .avatar-preview-wrap {
        position: relative;
        width: 80px;
        height: 80px;
      }

      .avatar-preview {
        width: 100%;
        height: 100%;
        border-radius: var(--radius-full);
        object-fit: cover;
        border: 2px solid var(--border);
        box-shadow: var(--shadow-sm);
      }

      .btn-remove-photo {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 22px;
        height: 22px;
        border-radius: var(--radius-full);
        background: var(--danger);
        color: #ffffff;
        border: 2px solid var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .photo-controls {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .photo-btn-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .photo-ready-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.75rem;
        color: var(--success);
        font-weight: 600;
        background: var(--success-light);
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--success-border);
      }

      .preset-avatars-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.35rem;
        flex-wrap: wrap;
      }
      .preset-label {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .preset-chips {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .preset-thumb {
        width: 28px;
        height: 28px;
        border-radius: var(--radius-full);
        object-fit: cover;
        cursor: pointer;
        border: 2px solid var(--border);
        transition: all var(--transition-fast);
      }
      .preset-thumb:hover, .preset-thumb.active {
        border-color: var(--primary);
        transform: scale(1.1);
        box-shadow: 0 0 0 2px var(--primary-light);
      }

      .upload-btn {
        width: fit-content;
        cursor: pointer;
      }

      .photo-hint {
        font-size: 0.72rem;
        color: var(--text-muted);
      }

      .divider {
        height: 1px;
        background: var(--border);
        margin: 1.5rem 0;
      }

      .form-section-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 1.25rem;
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

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        .form-grid > * {
          grid-column: 1 / -1 !important;
          width: 100% !important;
        }
        .photo-upload-section {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
        }
        .photo-controls {
          align-items: center;
          width: 100%;
        }
        .photo-btn-row {
          justify-content: center;
        }
        .preset-chips {
          justify-content: center;
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
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  studentForm!: FormGroup;
  isEditMode = false;
  studentId: string | null = null;
  existingStudent: Student | null = null;
  isSubmitting = false;

  defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23eef2ff'/><circle cx='50' cy='38' r='18' fill='%236366f1'/><path d='M20 86c0-16 14-24 30-24s30 8 30 24' fill='%236366f1'/></svg>";

  presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  ];

  previewImage: string | null = null;
  imageError: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.studentId = this.route.snapshot.paramMap.get('id');

    if (this.studentId) {
      this.isEditMode = true;
      this.loadStudentData(this.studentId);
    }
  }

  private initForm(): void {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(8)]],
      gender: ['Male', Validators.required],
      dateOfBirth: ['2003-01-01', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      status: ['Active', Validators.required],
    });
  }

  get f() {
    return this.studentForm.controls;
  }

  private loadStudentData(id: string): void {
    this.studentService.getStudentById(id).subscribe((student) => {
      if (!student) {
        this.notificationService.error(
          'Student Not Found',
          `No student record exists for ID: ${id}`
        );
        this.router.navigate(['/students']);
        return;
      }

      this.existingStudent = student;
      this.previewImage = student.profileImage || null;

      this.studentForm.patchValue({
        name: student.name,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        status: student.status,
      });
      this.cdr.markForCheck();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageError = null;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.imageError = 'File size exceeds maximum limit of 2MB.';
      this.cdr.markForCheck();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageError = 'Please upload a valid image file.';
      this.cdr.markForCheck();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
      this.imageError = null;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  selectPresetAvatar(url: string): void {
    this.previewImage = url;
    this.imageError = null;
    this.cdr.detectChanges();
  }

  removePhoto(): void {
    this.previewImage = null;
    this.imageError = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();
    const formValues = this.studentForm.value;

    const payload = {
      ...formValues,
      profileImage:
        this.previewImage ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    if (this.isEditMode && this.studentId) {
      this.studentService.updateStudent(this.studentId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/students', this.studentId]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.studentService.createStudent(payload).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.router.navigate(['/students', created.id]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    }
  }
}

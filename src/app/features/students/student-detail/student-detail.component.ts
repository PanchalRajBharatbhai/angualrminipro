import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Student } from '../../../core/models/student.model';
import { EnrollmentWithDetails } from '../../../core/models/enrollment.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="detail-container">
      @if (isLoading) {
        <app-loading-skeleton type="detail"></app-loading-skeleton>
      } @else if (!student) {
        <div class="card p-4">
          <app-empty-state
            icon="users"
            title="Student Not Found"
            message="The requested student profile could not be located. It may have been deleted or the ID is invalid."
            actionText="Return to Student Directory"
            actionIcon="arrow-left"
            (action)="returnToList()"
          ></app-empty-state>
        </div>
      } @else {
        <!-- Back Navigation & Top Actions -->
        <div class="detail-top-nav">
          <a routerLink="/students" class="btn-back">
            <app-icon name="arrow-left" [size]="16"></app-icon>
            <span>Back to Students</span>
          </a>
          <div class="action-buttons">
            <a
              [routerLink]="['/enrollments/add']"
              [queryParams]="{ studentId: student.id }"
              class="btn btn-primary btn-sm"
            >
              <app-icon name="plus" [size]="14"></app-icon>
              <span>Enroll in Course</span>
            </a>
            <a
              [routerLink]="['/students/edit', student.id]"
              class="btn btn-outline btn-sm"
            >
              <app-icon name="pencil" [size]="14"></app-icon>
              <span>Edit Record</span>
            </a>
            <button
              type="button"
              class="btn btn-outline btn-sm text-danger"
              (click)="isDeleteModalOpen = true"
            >
              <app-icon name="trash-2" [size]="14"></app-icon>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Student Profile Card -->
        <div class="card profile-card">
          <div class="profile-hero-banner">
            <div class="profile-avatar-wrapper">
              <img
                [src]="
                  student.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                "
                alt="Avatar"
                class="profile-avatar"
              />
            </div>
            <div class="profile-info-banner">
              <div class="name-status-row">
                <h2 class="student-name-banner">{{ student.name }}</h2>
                <app-status-badge [status]="student.status"></app-status-badge>
              </div>
              <div class="meta-row-banner">
                <span class="mono-id-banner">{{ student.id }}</span>
                <span class="dot-separator-banner">&bull;</span>
                <span class="enrolled-date-banner">Enrolled since {{ student.createdAt | date: 'MMMM yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Two Column Overview -->
        <div class="overview-grid">
          <!-- Contact & Personal Details Card -->
          <div class="card info-card">
            <div class="card-header">
              <h3>Personal & Contact Information</h3>
            </div>
            <div class="card-body">
              <div class="info-list">
                <div class="info-item">
                  <div class="item-icon">
                    <app-icon name="mail" [size]="16"></app-icon>
                  </div>
                  <div class="item-content">
                    <span class="item-label">Email Address</span>
                    <a [href]="'mailto:' + student.email" class="item-value-link">
                      {{ student.email }}
                    </a>
                  </div>
                </div>

                <div class="info-item">
                  <div class="item-icon">
                    <app-icon name="phone" [size]="16"></app-icon>
                  </div>
                  <div class="item-content">
                    <span class="item-label">Phone Number</span>
                    <span class="item-value">{{ student.phone }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="item-icon">
                    <app-icon name="user" [size]="16"></app-icon>
                  </div>
                  <div class="item-content">
                    <span class="item-label">Gender</span>
                    <span class="item-value">{{ student.gender }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="item-icon">
                    <app-icon name="calendar" [size]="16"></app-icon>
                  </div>
                  <div class="item-content">
                    <span class="item-label">Date of Birth</span>
                    <span class="item-value">{{ student.dateOfBirth | date: 'longDate' }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="item-icon">
                    <app-icon name="map-pin" [size]="16"></app-icon>
                  </div>
                  <div class="item-content">
                    <span class="item-label">Residential Address</span>
                    <span class="item-value">{{ student.address }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Academic Statistics Card -->
          <div class="card stats-summary-card">
            <div class="card-header">
              <h3>Academic Summary</h3>
            </div>
            <div class="card-body">
              <div class="metric-tiles">
                <div class="metric-tile">
                  <span class="metric-val">{{ enrollments.length }}</span>
                  <span class="metric-label">Total Courses</span>
                </div>
                <div class="metric-tile">
                  <span class="metric-val text-success">{{ activeEnrollmentsCount }}</span>
                  <span class="metric-label">Active Classes</span>
                </div>
                <div class="metric-tile">
                  <span class="metric-val">{{ completedEnrollmentsCount }}</span>
                  <span class="metric-label">Completed</span>
                </div>
              </div>

              <div class="quick-status-note">
                <app-icon name="info" [size]="16" class="text-primary"></app-icon>
                <span>
                  {{ student.name }} has {{ activeEnrollmentsCount }} active course enrollment(s).
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Enrolled Courses Table -->
        <div class="card table-card">
          <div class="card-header">
            <div class="header-with-badge">
              <h3>Course Enrollment History</h3>
              <span class="badge badge-inactive">{{ enrollments.length }} total</span>
            </div>
            <a
              [routerLink]="['/enrollments/add']"
              [queryParams]="{ studentId: student.id }"
              class="btn btn-outline btn-sm"
            >
              <app-icon name="plus" [size]="14"></app-icon>
              <span>Add Enrollment</span>
            </a>
          </div>

          @if (enrollments.length === 0) {
            <app-empty-state
              icon="book-open"
              title="No course enrollments"
              message="This student is not currently enrolled in any courses."
              actionText="Enroll Student Now"
              (action)="navigateToEnroll()"
            ></app-empty-state>
          } @else {
            <div class="table-responsive desktop-table-view">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Enrollment ID</th>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Enrolled Date</th>
                    <th>Fee Status</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th style="text-align: right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (enrollment of enrollments; track enrollment.id) {
                    <tr>
                      <td>
                        <span class="mono-id">{{ enrollment.id }}</span>
                      </td>
                      <td>
                        @if (enrollment.course) {
                          <a [routerLink]="['/courses', enrollment.course.id]" class="cell-primary-link">
                            {{ enrollment.course.name }}
                          </a>
                          <span class="cell-sub">{{ enrollment.course.code }}</span>
                        } @else {
                          <span class="text-muted">Unlinked Course</span>
                        }
                      </td>
                      <td>{{ enrollment.course?.instructor || 'N/A' }}</td>
                      <td>{{ enrollment.enrollmentDate | date: 'mediumDate' }}</td>
                      <td>
                        <app-status-badge [status]="enrollment.paymentStatus"></app-status-badge>
                      </td>
                      <td>
                        @if (enrollment.grade) {
                          <span class="badge-grade">
                            <app-icon name="award" [size]="12"></app-icon>
                            <span>{{ enrollment.grade }}</span>
                          </span>
                        } @else {
                          <span class="text-muted" style="font-size: 0.8125rem">—</span>
                        }
                      </td>
                      <td>
                        <app-status-badge [status]="enrollment.status"></app-status-badge>
                      </td>
                      <td style="text-align: right">
                        <a
                          [routerLink]="['/enrollments', enrollment.id]"
                          class="btn-icon"
                          title="View Enrollment"
                        >
                          <app-icon name="eye" [size]="16"></app-icon>
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mobile Card Layout -->
            <div class="mobile-card-list p-3">
              @for (enrollment of enrollments; track enrollment.id) {
                <div class="mobile-data-card">
                  <div class="mobile-data-card-header">
                    <div>
                      <span class="mono-id">{{ enrollment.id }}</span>
                      <h4 class="mt-1">{{ enrollment.course?.name }}</h4>
                    </div>
                    <app-status-badge [status]="enrollment.status"></app-status-badge>
                  </div>
                  <div class="mobile-data-card-body">
                    <div class="mobile-data-card-item">
                      <span class="label">Instructor</span>
                      <span class="val">{{ enrollment.course?.instructor }}</span>
                    </div>
                    <div class="mobile-data-card-item">
                      <span class="label">Date</span>
                      <span class="val">{{ enrollment.enrollmentDate | date: 'shortDate' }}</span>
                    </div>
                    <div class="mobile-data-card-item">
                      <span class="label">Grade</span>
                      <span class="val">
                        @if (enrollment.grade) {
                          <strong class="text-primary">{{ enrollment.grade }}</strong>
                        } @else {
                          <span class="text-muted">Not Graded</span>
                        }
                      </span>
                    </div>
                  </div>
                  <div class="mobile-data-card-actions">
                    <a [routerLink]="['/enrollments', enrollment.id]" class="btn btn-outline btn-sm">
                      <app-icon name="eye" [size]="14"></app-icon>
                      <span>View</span>
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Delete Student Confirmation Modal -->
        <app-confirm-modal
          [isOpen]="isDeleteModalOpen"
          title="Delete Student Record?"
          [message]="'Are you sure you want to delete ' + student.name + '? This action cannot be undone.'"
          details="Deleting this student will remove their academic profile from the directory."
          confirmText="Delete Student"
          variant="danger"
          [loading]="isDeleting"
          (confirm)="confirmDelete()"
          (cancel)="isDeleteModalOpen = false"
        ></app-confirm-modal>
      }
    </div>
  `,
  styles: [
    `
      .detail-container {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .detail-top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        padding-bottom: 0.25rem;
      }

      .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        padding: 0.45rem 0.75rem;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
      }
      .btn-back:hover {
        color: var(--primary);
        background: var(--surface-hover);
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .profile-card {
        position: relative;
        overflow: hidden;
        border: none;
        box-shadow: var(--shadow-sm);
        border-radius: var(--radius-lg);
      }

      .profile-hero-banner {
        background: linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%);
        padding: 2.25rem 2.5rem;
        display: flex;
        align-items: center;
        gap: 2rem;
        border-radius: var(--radius-lg);
        color: #ffffff;
        box-shadow: 0 4px 20px -2px rgba(79, 70, 229, 0.25);
      }

      .profile-avatar-wrapper {
        position: relative;
        flex-shrink: 0;
      }

      .profile-avatar {
        width: 100px;
        height: 100px;
        border-radius: var(--radius-full);
        object-fit: cover;
        border: 4px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        background: #ffffff;
        display: block;
      }

      .profile-info-banner {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .name-status-row {
        display: flex;
        align-items: center;
        gap: 1.15rem;
        flex-wrap: wrap;
      }

      .student-name-banner {
        font-size: 1.85rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.02em;
        margin: 0;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .meta-row-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.92);
        flex-wrap: wrap;
      }

      .mono-id-banner {
        font-family: var(--font-mono, monospace);
        background: rgba(255, 255, 255, 0.22);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.4);
        padding: 0.2rem 0.65rem;
        border-radius: var(--radius-sm);
        font-size: 0.8125rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        backdrop-filter: blur(4px);
      }

      .dot-separator-banner {
        color: rgba(255, 255, 255, 0.65);
      }

      .enrolled-date-banner {
        color: rgba(255, 255, 255, 0.92);
      }

      .overview-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1.75rem;
      }
      @media (max-width: 860px) {
        .overview-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 1.125rem;
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .item-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        background: var(--surface-secondary);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .item-content {
        display: flex;
        flex-direction: column;
      }

      .item-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .item-value {
        font-size: 0.875rem;
        color: var(--text-primary);
        font-weight: 500;
        margin-top: 1px;
      }

      .item-value-link {
        font-size: 0.875rem;
        color: var(--primary);
        font-weight: 500;
        margin-top: 1px;
      }

      .metric-tiles {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        text-align: center;
      }

      .metric-tile {
        padding: 0.875rem 0.5rem;
        background: var(--surface-secondary);
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .metric-val {
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .metric-label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }

      .quick-status-note {
        margin-top: 1.25rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        background: var(--primary-light);
        border: 1px solid var(--primary-border);
        display: flex;
        align-items: center;
        gap: 0.625rem;
        font-size: 0.8125rem;
        color: var(--primary-dark);
      }

      .header-with-badge {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }

      .cell-primary-link {
        font-weight: 600;
        color: var(--text-primary);
      }
      .cell-primary-link:hover {
        color: var(--primary);
      }

      .cell-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        display: block;
      }

      .text-danger {
        color: var(--danger);
      }
      .text-danger:hover {
        background: var(--danger-light);
      }

      .badge-grade {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary);
        border: 1px solid rgba(99, 102, 241, 0.2);
        padding: 0.15rem 0.45rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .detail-top-nav {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 0.5rem;
        }
        .action-buttons .btn {
          width: 100%;
          justify-content: center;
        }
        .profile-hero-banner {
          flex-direction: column;
          align-items: flex-start;
          padding: 1.5rem 1.25rem;
          gap: 1.25rem;
        }
        .student-name-banner {
          font-size: 1.5rem;
        }
        .meta-row-banner {
          flex-wrap: wrap;
        }
        .metric-tiles {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        .overview-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  private cdr = inject(ChangeDetectorRef);

  student: Student | null = null;
  enrollments: EnrollmentWithDetails[] = [];
  isLoading = true;

  isDeleteModalOpen = false;
  isDeleting = false;

  get activeEnrollmentsCount(): number {
    return this.enrollments.filter((e) => e.status === 'Active').length;
  }

  get completedEnrollmentsCount(): number {
    return this.enrollments.filter((e) => e.status === 'Completed').length;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadDetails(id);
      }
    });
  }

  loadDetails(id: string): void {
    this.isLoading = true;
    const cleanId = decodeURIComponent(id).trim();
    this.studentService.getStudentById(cleanId).subscribe((student) => {
      this.student = student || null;
      if (student) {
        this.enrollmentService
          .getEnrollmentsByStudent(student.id)
          .subscribe((enrollments) => {
            this.enrollments = enrollments;
            this.isLoading = false;
            this.cdr.markForCheck();
          });
      } else {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  returnToList(): void {
    this.router.navigate(['/students']);
  }

  navigateToEnroll(): void {
    if (this.student) {
      this.router.navigate(['/enrollments/add'], {
        queryParams: { studentId: this.student.id },
      });
    }
  }

  confirmDelete(): void {
    if (!this.student) return;

    this.isDeleting = true;
    this.studentService.deleteStudent(this.student.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.router.navigate(['/students']);
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Course } from '../../../core/models/course.model';
import { EnrollmentWithDetails } from '../../../core/models/enrollment.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CourseDurationPipe } from '../../../shared/pipes/course-duration.pipe';
import { SeatAvailabilityPipe } from '../../../shared/pipes/seat-availability.pipe';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    CourseDurationPipe,
    SeatAvailabilityPipe,
  ],
  template: `
    <div class="detail-container">
      @if (isLoading) {
        <app-loading-skeleton type="detail"></app-loading-skeleton>
      } @else if (!course) {
        <div class="card p-4">
          <app-empty-state
            icon="book-open"
            title="Course Not Found"
            message="The requested course does not exist or has been removed from the catalogue."
            actionText="Return to Courses"
            actionIcon="arrow-left"
            (action)="returnToList()"
          ></app-empty-state>
        </div>
      } @else {
        <!-- Back Navigation & Top Actions -->
        <div class="detail-top-nav">
          <a routerLink="/courses" class="btn-back">
            <app-icon name="arrow-left" [size]="16"></app-icon>
            <span>Back to Courses</span>
          </a>
          <div class="action-buttons">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              [disabled]="course.availableSeats <= 0 || course.status === 'Completed' || course.status === 'Inactive'"
              (click)="navigateToEnroll()"
              [title]="course.availableSeats <= 0 ? 'Course is full' : 'Enroll a student'"
            >
              <app-icon name="plus" [size]="14"></app-icon>
              <span>Enroll Student</span>
            </button>
            <a
              [routerLink]="['/courses/edit', course.id]"
              class="btn btn-outline btn-sm"
            >
              <app-icon name="pencil" [size]="14"></app-icon>
              <span>Edit Course</span>
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

        <!-- Course Header Card -->
        <div class="card course-header-card">
          <div class="course-header-top">
            <div class="code-category-row">
              <span class="mono-code">{{ course.code }}</span>
              <span class="category-pill">{{ course.category }}</span>
              <app-status-badge [status]="course.status"></app-status-badge>
            </div>
            <h2>{{ course.name }}</h2>
            <p class="instructor-line">
              <span>Taught by</span>
              <strong>{{ course.instructor }}</strong>
            </p>
          </div>

          <!-- Description -->
          <p class="course-description">{{ course.description }}</p>

          <!-- Warning Banner if Course is Full -->
          @if (course.availableSeats <= 0) {
            <div class="course-full-banner">
              <app-icon name="alert-triangle" [size]="18"></app-icon>
              <div>
                <strong>Course Registration Full</strong>
                <span>All {{ course.capacity }} seats have been allocated. New enrollments are currently closed.</span>
              </div>
            </div>
          }
        </div>

        <!-- Specifications & Capacity Row -->
        <div class="specs-grid">
          <!-- Capacity Visualizer Card -->
          <div class="card capacity-card">
            <div class="card-header">
              <h3>Seat Capacity & Availability</h3>
              <span class="badge" [class.badge-active]="course.availableSeats > 3" [class.badge-warning]="course.availableSeats > 0 && course.availableSeats <= 3" [class.badge-cancelled]="course.availableSeats <= 0">
                {{ course.availableSeats | seatAvailability }}
              </span>
            </div>
            <div class="card-body">
              <div class="capacity-stats">
                <div class="cap-stat-box">
                  <span class="cap-num">{{ course.capacity }}</span>
                  <span class="cap-lbl">Total Capacity</span>
                </div>
                <div class="cap-stat-box">
                  <span class="cap-num text-primary">{{ enrolledStudentsCount }}</span>
                  <span class="cap-lbl">Active Enrolled</span>
                </div>
                <div class="cap-stat-box">
                  <span class="cap-num" [class.text-danger]="course.availableSeats <= 0" [class.text-success]="course.availableSeats > 0">
                    {{ course.availableSeats }}
                  </span>
                  <span class="cap-lbl">Available Seats</span>
                </div>
              </div>

              <div class="capacity-bar-group">
                <div class="capacity-bar-header">
                  <span>Occupancy</span>
                  <strong>{{ occupancyPercentage }}%</strong>
                </div>
                <div class="capacity-progress lg">
                  <div
                    class="capacity-progress-fill"
                    [style.width.%]="occupancyPercentage"
                    [ngClass]="occupancyPercentage >= 90 ? 'full' : occupancyPercentage >= 70 ? 'warn' : 'safe'"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Logistics Card -->
          <div class="card logistics-card">
            <div class="card-header">
              <h3>Course Logistics</h3>
            </div>
            <div class="card-body">
              <div class="logistics-list">
                <div class="logistics-item">
                  <div class="item-icon">
                    <app-icon name="clock" [size]="16"></app-icon>
                  </div>
                  <div>
                    <span class="label">Course Duration</span>
                    <span class="val">{{ course.duration | courseDuration }}</span>
                  </div>
                </div>

                <div class="logistics-item">
                  <div class="item-icon">
                    <app-icon name="calendar" [size]="16"></app-icon>
                  </div>
                  <div>
                    <span class="label">Schedule Window</span>
                    <span class="val">{{ course.startDate | date: 'mediumDate' }} to {{ course.endDate | date: 'mediumDate' }}</span>
                  </div>
                </div>

                <div class="logistics-item">
                  <div class="item-icon">
                    <app-icon name="dollar-sign" [size]="16"></app-icon>
                  </div>
                  <div>
                    <span class="label">Tuition Fee</span>
                    <span class="val fee-val">{{ course.fee | currency: 'INR': 'symbol': '1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enrolled Students Table -->
        <div class="card table-card">
          <div class="card-header">
            <div class="header-with-badge">
              <h3>Enrolled Students Roster</h3>
              <span class="badge badge-inactive">{{ enrollments.length }} records</span>
            </div>
            <button
              type="button"
              class="btn btn-outline btn-sm"
              [disabled]="course.availableSeats <= 0 || course.status === 'Completed' || course.status === 'Inactive'"
              (click)="navigateToEnroll()"
            >
              <app-icon name="plus" [size]="14"></app-icon>
              <span>Enroll Student</span>
            </button>
          </div>

          @if (enrollments.length === 0) {
            <app-empty-state
              icon="users"
              title="No students enrolled yet"
              message="There are no active or pending student enrollments for this course offering."
              actionText="Enroll First Student"
              (action)="navigateToEnroll()"
            ></app-empty-state>
          } @else {
            <div class="table-responsive desktop-table-view">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Enrollment ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Enrolled Date</th>
                    <th>Tuition Status</th>
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
                        @if (enrollment.student) {
                          <div class="student-cell">
                            <img
                              [src]="enrollment.student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'"
                              alt="Avatar"
                              class="table-avatar"
                            />
                            <a [routerLink]="['/students', enrollment.student.id]" class="cell-primary-link">
                              {{ enrollment.student.name }}
                            </a>
                          </div>
                        } @else {
                          <span class="text-muted">Unlinked Student</span>
                        }
                      </td>
                      <td>{{ enrollment.student?.email || 'N/A' }}</td>
                      <td>{{ enrollment.enrollmentDate | date: 'mediumDate' }}</td>
                      <td>
                        <app-status-badge [status]="enrollment.paymentStatus"></app-status-badge>
                      </td>
                      <td>
                        @if (enrollment.grade) {
                          <span class="badge badge-grade">
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

            <!-- Mobile Card View -->
            <div class="mobile-card-list p-3">
              @for (enrollment of enrollments; track enrollment.id) {
                <div class="mobile-data-card">
                  <div class="mobile-data-card-header">
                    <div>
                      <span class="mono-id">{{ enrollment.id }}</span>
                      <h4 class="mt-1">{{ enrollment.student?.name }}</h4>
                    </div>
                    <app-status-badge [status]="enrollment.status"></app-status-badge>
                  </div>
                  <div class="mobile-data-card-body">
                    <div class="mobile-data-card-item">
                      <span class="label">Date</span>
                      <span class="val">{{ enrollment.enrollmentDate | date: 'shortDate' }}</span>
                    </div>
                    <div class="mobile-data-card-item">
                      <span class="label">Fee Status</span>
                      <span class="val">{{ enrollment.paymentStatus }}</span>
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

        <!-- Delete Course Confirmation Dialog -->
        <app-confirm-modal
          [isOpen]="isDeleteModalOpen"
          title="Delete Course Offering?"
          [message]="'Are you sure you want to delete course ' + course.name + '?'"
          details="Note: Courses with active student registrations cannot be removed until enrollments are resolved."
          confirmText="Delete Course"
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

      .course-header-card {
        padding: 2rem 2.25rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .code-category-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.4rem;
      }

      .mono-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--primary);
        background: var(--primary-light);
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-sm);
        letter-spacing: 0.02em;
      }

      .category-pill {
        font-size: 0.8rem;
        background: var(--surface-secondary);
        color: var(--text-secondary);
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        font-weight: 500;
      }

      .course-header-top h2 {
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.25;
        letter-spacing: -0.015em;
      }

      .instructor-line {
        font-size: 0.9rem;
        color: var(--text-secondary);
        display: flex;
        gap: 0.45rem;
        margin-top: 0.35rem;
      }

      .course-description {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        max-width: 950px;
      }

      .course-full-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1.125rem;
        background: var(--danger-light);
        border: 1px solid var(--danger-border);
        border-radius: var(--radius-md);
        color: var(--danger-text);
        font-size: 0.875rem;
      }
      .course-full-banner div {
        display: flex;
        flex-direction: column;
        line-height: 1.35;
      }

      .specs-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1.25rem;
      }
      @media (max-width: 860px) {
        .specs-grid {
          grid-template-columns: 1fr;
        }
      }

      .capacity-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .cap-stat-box {
        background: var(--surface-secondary);
        padding: 0.875rem 0.5rem;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .cap-num {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .cap-lbl {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }

      .capacity-bar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin-bottom: 0.35rem;
      }

      .capacity-progress.lg {
        height: 10px;
      }

      .logistics-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .logistics-item {
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

      .label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        display: block;
      }
      .val {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary);
      }
      .fee-val {
        font-size: 1rem;
        font-weight: 700;
        color: var(--primary);
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }

      .table-avatar {
        width: 30px;
        height: 30px;
        border-radius: var(--radius-full);
        object-fit: cover;
      }

      .cell-primary-link {
        font-weight: 600;
        color: var(--text-primary);
      }
      .cell-primary-link:hover {
        color: var(--primary);
      }

      .mono-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--primary);
      }

      .header-with-badge {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }

      .text-danger { color: var(--danger); }
      .text-success { color: var(--success); }

      @media (max-width: 640px) {
        .detail-container {
          gap: 1.25rem;
        }
        .detail-top-nav {
          flex-direction: column;
          align-items: stretch;
          gap: 0.65rem;
        }
        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          width: 100%;
        }
        .action-buttons .btn-primary {
          grid-column: 1 / -1;
          width: 100%;
        }
        .action-buttons .btn {
          width: 100%;
          justify-content: center;
          padding: 0.55rem 0.65rem;
          font-size: 0.8125rem;
        }
        .course-header-card {
          padding: 1.25rem 1rem;
          gap: 0.875rem;
        }
        .code-category-row {
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .course-header-top h2 {
          font-size: 1.35rem;
          line-height: 1.3;
        }
        .instructor-line {
          font-size: 0.85rem;
        }
        .course-description {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .specs-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .capacity-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem;
        }
        .cap-stat-box {
          padding: 0.65rem 0.35rem;
          text-align: center;
        }
        .cap-num {
          font-size: 1.25rem;
        }
        .cap-lbl {
          font-size: 0.68rem;
        }
        .logistics-card .card-body,
        .capacity-card .card-body {
          padding: 1rem;
        }
        .logistics-list .logistics-item {
          padding: 0.6rem 0.75rem;
          font-size: 0.8125rem;
        }
      }

      @media (max-width: 480px) {
        .course-header-card {
          padding: 1rem 0.85rem;
        }
        .course-header-top h2 {
          font-size: 1.225rem;
        }
      }
    `,
  ],
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private cdr = inject(ChangeDetectorRef);

  course: Course | null = null;
  enrollments: EnrollmentWithDetails[] = [];
  isLoading = true;

  isDeleteModalOpen = false;
  isDeleting = false;

  get enrolledStudentsCount(): number {
    return this.enrollments.filter((e) => e.status === 'Active').length;
  }

  get occupancyPercentage(): number {
    if (!this.course || this.course.capacity <= 0) return 100;
    const occupied = this.course.capacity - this.course.availableSeats;
    return Math.min(100, Math.round((occupied / this.course.capacity) * 100));
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
    this.courseService.getCourseById(cleanId).subscribe((course) => {
      this.course = course || null;
      if (course) {
        this.enrollmentService
          .getEnrollmentsByCourse(course.id)
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
    this.router.navigate(['/courses']);
  }

  navigateToEnroll(): void {
    if (this.course) {
      this.router.navigate(['/enrollments/add'], {
        queryParams: { courseId: this.course.id },
      });
    }
  }

  confirmDelete(): void {
    if (!this.course) return;

    this.isDeleting = true;
    this.courseService.deleteCourse(this.course.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.router.navigate(['/courses']);
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }
}

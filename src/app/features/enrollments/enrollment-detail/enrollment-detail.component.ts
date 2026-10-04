import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { EnrollmentWithDetails } from '../../../core/models/enrollment.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-enrollment-detail',
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
      } @else if (!enrollment) {
        <div class="card p-4">
          <app-empty-state
            icon="clipboard-list"
            title="Enrollment Record Not Found"
            message="The requested enrollment record could not be found or has been removed."
            actionText="Return to Enrollments"
            actionIcon="arrow-left"
            (action)="returnToList()"
          ></app-empty-state>
        </div>
      } @else {
        <!-- Top Nav & Actions -->
        <div class="detail-top-nav">
          <a routerLink="/enrollments" class="btn-back">
            <app-icon name="arrow-left" [size]="16"></app-icon>
            <span>Back to Enrollments</span>
          </a>
          <div class="action-buttons">
            <a
              [routerLink]="['/enrollments/edit', enrollment.id]"
              class="btn btn-outline btn-sm"
            >
              <app-icon name="pencil" [size]="14"></app-icon>
              <span>Edit Enrollment</span>
            </a>
            @if (enrollment.status === 'Active') {
              <button
                type="button"
                class="btn btn-outline btn-sm text-warning"
                (click)="isCancelModalOpen = true"
              >
                <app-icon name="x" [size]="14"></app-icon>
                <span>Cancel Enrollment</span>
              </button>
            }
            <button
              type="button"
              class="btn btn-outline btn-sm text-danger"
              (click)="isDeleteModalOpen = true"
            >
              <app-icon name="trash-2" [size]="14"></app-icon>
              <span>Delete Record</span>
            </button>
          </div>
        </div>

        <!-- Enrollment Summary Card -->
        <div class="card main-enrollment-card">
          <div class="enrollment-header-top">
            <div class="id-status-row">
              <span class="mono-id">{{ enrollment.id }}</span>
            </div>
            <h2>Course Enrollment Record</h2>
            <p class="date-line">Registered on {{ enrollment.enrollmentDate | date: 'fullDate' }}</p>
          </div>

          <!-- Academic & Enrollment Specifications Grid -->
          <div class="enrollment-specs-grid">
            <div class="spec-card">
              <span class="spec-label">Enrollment Date</span>
              <span class="spec-val">{{ enrollment.enrollmentDate | date: 'longDate' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Tuition Fee Status</span>
              <span class="spec-val">
                <app-status-badge [status]="enrollment.paymentStatus"></app-status-badge>
              </span>
            </div>
            <div class="spec-card highlight">
              <span class="spec-label">Grade / Academic Assessment</span>
              <div class="spec-val">
                @if (enrollment.grade) {
                  <span class="grade-score-pill">
                    <app-icon name="award" [size]="16" class="text-primary"></app-icon>
                    <strong>{{ enrollment.grade }}</strong>
                  </span>
                } @else {
                  <span class="text-muted" style="font-size: 0.85rem">Pending Evaluation</span>
                }
              </div>
            </div>
            <div class="spec-card">
              <span class="spec-label">Registration Status</span>
              <span class="spec-val">
                <app-status-badge [status]="enrollment.status"></app-status-badge>
              </span>
            </div>
          </div>

          @if (enrollment.notes) {
            <div class="notes-callout">
              <app-icon name="info" [size]="16" class="text-primary"></app-icon>
              <div>
                <strong>Administrative Notes & Remarks:</strong>
                <span>{{ enrollment.notes }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Relational Cards Grid (Student Card & Course Card) -->
        <div class="relation-grid">
          <!-- Linked Student Card -->
          <div class="card entity-card">
            <div class="card-header">
              <h3>Enrolled Student Profile</h3>
              @if (enrollment.student) {
                <a [routerLink]="['/students', enrollment.student.id]" class="view-profile-link">
                  <span>View Full Profile</span>
                  <app-icon name="arrow-right" [size]="13"></app-icon>
                </a>
              }
            </div>
            <div class="card-body">
              @if (enrollment.student; as student) {
                <div class="student-profile-peek">
                  <img
                    [src]="
                      student.profileImage ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    "
                    alt="Student Avatar"
                    class="student-avatar"
                  />
                  <div class="student-info">
                    <h4>{{ student.name }}</h4>
                    <span class="mono-id-sub">{{ student.id }}</span>
                  </div>
                </div>

                <div class="entity-details-list">
                  <div class="entity-detail-row">
                    <span class="label">Email:</span>
                    <span class="val">{{ student.email }}</span>
                  </div>
                  <div class="entity-detail-row">
                    <span class="label">Phone:</span>
                    <span class="val">{{ student.phone }}</span>
                  </div>
                  <div class="entity-detail-row">
                    <span class="label">Gender:</span>
                    <span class="val">{{ student.gender }}</span>
                  </div>
                </div>
              } @else {
                <span class="text-muted">Student details unavailable.</span>
              }
            </div>
          </div>

          <!-- Linked Course Card -->
          <div class="card entity-card">
            <div class="card-header">
              <h3>Enrolled Course Specifications</h3>
              @if (enrollment.course) {
                <a [routerLink]="['/courses', enrollment.course.id]" class="view-profile-link">
                  <span>View Course Syllabus</span>
                  <app-icon name="arrow-right" [size]="13"></app-icon>
                </a>
              }
            </div>
            <div class="card-body">
              @if (enrollment.course; as course) {
                <div class="course-profile-peek">
                  <span class="mono-code">{{ course.code }}</span>
                  <h4>{{ course.name }}</h4>
                  <span class="instructor-sub">Instructor: {{ course.instructor }}</span>
                </div>

                <div class="entity-details-list">
                  <div class="entity-detail-row">
                    <span class="label">Category:</span>
                    <span class="val">{{ course.category }}</span>
                  </div>
                  <div class="entity-detail-row">
                    <span class="label">Duration:</span>
                    <span class="val">{{ course.duration }}</span>
                  </div>
                  <div class="entity-detail-row">
                    <span class="label">Tuition Fee:</span>
                    <span class="val font-semibold text-primary">
                      {{ course.fee | currency: 'INR': 'symbol': '1.0-0' }}
                    </span>
                  </div>
                  <div class="entity-detail-row">
                    <span class="label">Remaining Seats:</span>
                    <span class="val">{{ course.availableSeats }} / {{ course.capacity }}</span>
                  </div>
                </div>
              } @else {
                <span class="text-muted">Course details unavailable.</span>
              }
            </div>
          </div>
        </div>

        <!-- Cancel Confirmation Modal -->
        <app-confirm-modal
          [isOpen]="isCancelModalOpen"
          title="Cancel Student Enrollment?"
          [message]="'Confirm cancellation of ' + (enrollment.student?.name || 'this student') + ' in ' + (enrollment.course?.name || 'this course') + '?'"
          details="The seat will be released back to the course available capacity pool."
          confirmText="Confirm Cancellation"
          variant="warning"
          [loading]="isActionLoading"
          (confirm)="confirmCancel()"
          (cancel)="isCancelModalOpen = false"
        ></app-confirm-modal>

        <!-- Delete Confirmation Modal -->
        <app-confirm-modal
          [isOpen]="isDeleteModalOpen"
          title="Delete Enrollment?"
          [message]="'Permanently delete enrollment history for record ' + enrollment.id + '?'"
          details="This action permanently deletes the relationship record from database."
          confirmText="Delete Enrollment"
          variant="danger"
          [loading]="isActionLoading"
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

      .main-enrollment-card {
        padding: 2rem 2.25rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .id-status-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
      }

      .mono-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--primary);
        background: var(--primary-light);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-sm);
        letter-spacing: 0.02em;
      }

      .enrollment-header-top h2 {
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.25;
        letter-spacing: -0.015em;
        margin: 0.15rem 0;
      }

      .date-line {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0.25rem 0 0.5rem 0;
      }

      .badge-grade {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(99, 102, 241, 0.12);
        color: var(--primary);
        border: 1px solid rgba(99, 102, 241, 0.25);
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .enrollment-specs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.25rem;
        margin-top: 0.75rem;
      }

      .spec-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem 1.35rem;
        border-radius: var(--radius-lg);
        background: var(--surface-secondary);
        border: 1px solid var(--border);
        box-sizing: border-box;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      }
      .spec-card:hover {
        box-shadow: var(--shadow-sm);
      }
      .spec-card.highlight {
        background: var(--surface-card);
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
      }

      .spec-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .spec-val {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        min-height: 28px;
      }

      .grade-score-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
      }

      .notes-callout {
        display: flex;
        align-items: flex-start;
        gap: 0.875rem;
        padding: 1.125rem 1.35rem;
        border-radius: var(--radius-md);
        background: var(--surface-secondary);
        border: 1px solid var(--border);
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-secondary);
        margin-top: 0.5rem;
      }
      .notes-callout strong {
        color: var(--text-primary);
        margin-right: 0.35rem;
      }

      .relation-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.75rem;
      }
      @media (max-width: 900px) {
        .relation-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      .view-profile-link {
        font-size: 0.8125rem;
        color: var(--primary);
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast);
      }
      .view-profile-link:hover {
        background: var(--surface-hover);
      }

      .student-profile-peek {
        display: flex;
        align-items: center;
        gap: 1.125rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border-subtle);
      }

      .student-avatar {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-full);
        object-fit: cover;
        border: 2px solid var(--border);
        box-shadow: var(--shadow-sm);
      }

      .student-info h4 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.2rem;
      }

      .mono-id-sub {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.775rem;
        color: var(--text-muted);
      }

      .course-profile-peek {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border-subtle);
      }

      .mono-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.775rem;
        font-weight: 700;
        color: var(--primary);
        background: var(--primary-light);
        padding: 0.15rem 0.45rem;
        border-radius: var(--radius-sm);
        width: fit-content;
      }

      .course-profile-peek h4 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0.2rem 0;
      }

      .instructor-sub {
        font-size: 0.8125rem;
        color: var(--text-secondary);
      }

      .entity-details-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .entity-detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
        padding: 0.65rem 0.85rem;
        border-radius: var(--radius-md);
        background: var(--surface-secondary);
        border: 1px solid var(--border-subtle);
        font-size: 0.875rem;
        transition: background var(--transition-fast);
      }
      .entity-detail-row:hover {
        background: var(--surface-tertiary);
      }
      .entity-detail-row .label {
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 0.8125rem;
        white-space: nowrap;
      }
      .entity-detail-row .val {
        color: var(--text-primary);
        font-weight: 600;
        text-align: right;
        word-break: break-word;
      }

      .mt-1 {
        margin-top: 0.35rem;
      }

      .text-warning { color: var(--warning); }
      .text-danger { color: var(--danger); }

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
        .action-buttons .btn:first-child {
          grid-column: 1 / -1;
          width: 100%;
        }
        .action-buttons .btn {
          width: 100%;
          justify-content: center;
          padding: 0.55rem 0.65rem;
          font-size: 0.8125rem;
        }
        .main-enrollment-card {
          padding: 1.25rem 1rem;
        }
        .id-status-row {
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .enrollment-header-top h2 {
          font-size: 1.35rem;
          line-height: 1.3;
        }
        .date-line {
          font-size: 0.825rem;
        }
        .enrollment-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.65rem;
          margin: 1rem 0;
        }
        .spec-card {
          padding: 0.75rem 0.8rem;
        }
        .spec-label {
          font-size: 0.68rem;
        }
        .spec-val {
          font-size: 0.95rem;
          min-height: auto;
        }
        .grade-score-pill {
          font-size: 1.05rem;
        }
        .relation-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .entity-card .card-body {
          padding: 1rem;
        }
        .entity-detail-row {
          padding: 0.55rem 0.75rem;
          font-size: 0.8125rem;
        }
      }

      @media (max-width: 480px) {
        .main-enrollment-card {
          padding: 1rem 0.85rem;
        }
        .enrollment-header-top h2 {
          font-size: 1.225rem;
        }
        .spec-card {
          padding: 0.65rem 0.7rem;
        }
      }
    `,
  ],
})
export class EnrollmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private enrollmentService = inject(EnrollmentService);
  private cdr = inject(ChangeDetectorRef);

  enrollment: EnrollmentWithDetails | null = null;
  isLoading = true;

  isCancelModalOpen = false;
  isDeleteModalOpen = false;
  isActionLoading = false;

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
    this.enrollmentService.getEnrollmentById(cleanId).subscribe((enr) => {
      this.enrollment = enr || null;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  returnToList(): void {
    this.router.navigate(['/enrollments']);
  }

  confirmCancel(): void {
    if (!this.enrollment) return;

    this.isActionLoading = true;
    this.enrollmentService.cancelEnrollment(this.enrollment.id).subscribe({
      next: (updated) => {
        this.isActionLoading = false;
        this.isCancelModalOpen = false;
        this.loadDetails(updated.id);
      },
      error: () => {
        this.isActionLoading = false;
      },
    });
  }

  confirmDelete(): void {
    if (!this.enrollment) return;

    this.isActionLoading = true;
    this.enrollmentService.deleteEnrollment(this.enrollment.id).subscribe({
      next: () => {
        this.isActionLoading = false;
        this.isDeleteModalOpen = false;
        this.router.navigate(['/enrollments']);
      },
      error: () => {
        this.isActionLoading = false;
      },
    });
  }
}

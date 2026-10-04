import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseService } from '../../../core/services/course.service';
import {
  EnrollmentStatus,
  EnrollmentWithDetails,
  PaymentStatus,
} from '../../../core/models/enrollment.model';
import { Course } from '../../../core/models/course.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IconComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    PaginationComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>Enrollment Management</h2>
          <p>Register students into courses, process cancellations, and manage tuition records.</p>
        </div>
        <a routerLink="/enrollments/add" class="btn btn-primary">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>New Enrollment</span>
        </a>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-body">
          <div class="search-input-wrap">
            <app-icon name="search" [size]="16" class="search-icon"></app-icon>
            <input
              type="text"
              class="form-control search-field"
              placeholder="Search by student, course name, ID..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
            />
            @if (searchQuery) {
              <button
                type="button"
                class="btn-clear-search"
                (click)="searchQuery = ''; onFilterChange()"
                aria-label="Clear search"
              >
                <app-icon name="x" [size]="14"></app-icon>
              </button>
            }
          </div>

          <div class="filter-controls">
            <!-- Course Filter -->
            <select
              class="form-control select-filter"
              [(ngModel)]="courseFilter"
              (ngModelChange)="onFilterChange()"
            >
              <option value="All">All Courses</option>
              @for (c of courses; track c.id) {
                <option [value]="c.id">{{ c.code }} - {{ c.name }}</option>
              }
            </select>

            <!-- Status Filter -->
            <select
              class="form-control select-filter"
              [(ngModel)]="statusFilter"
              (ngModelChange)="onFilterChange()"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <!-- Payment Status Filter -->
            <select
              class="form-control select-filter"
              [(ngModel)]="paymentFilter"
              (ngModelChange)="onFilterChange()"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Waived">Waived</option>
            </select>

            @if (isFiltered) {
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                (click)="resetFilters()"
              >
                <app-icon name="refresh" [size]="14"></app-icon>
                <span>Reset</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Main Content / Table -->
      <div class="card table-card">
        @if (isLoading) {
          <app-loading-skeleton type="table"></app-loading-skeleton>
        } @else if (pagedEnrollments.length === 0) {
          <app-empty-state
            icon="clipboard-list"
            title="No enrollments found"
            [message]="
              isFiltered
                ? 'No enrollment records match your search criteria. Try modifying your filters.'
                : 'There are currently no course enrollments registered.'
            "
            [actionText]="isFiltered ? 'Reset Filters' : 'Create First Enrollment'"
            (action)="isFiltered ? resetFilters() : null"
          ></app-empty-state>
        } @else {
          <!-- Desktop Table -->
          <div class="desktop-table-view table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Enrollment Date</th>
                  <th>Tuition Status</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th style="text-align: right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (enrollment of pagedEnrollments; track enrollment.id) {
                  <tr (click)="navigateToDetail(enrollment.id)" class="clickable-row">
                    <td>
                      <a
                        [routerLink]="['/enrollments', enrollment.id]"
                        (click)="$event.stopPropagation()"
                        class="mono-id hover-link"
                      >
                        {{ enrollment.id }}
                      </a>
                    </td>
                    <td>
                      @if (enrollment.student) {
                        <div class="student-cell">
                          <img
                            [src]="
                              enrollment.student.profileImage ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                            "
                            alt="Avatar"
                            class="table-avatar"
                          />
                          <div class="cell-text">
                            <a
                              [routerLink]="['/students', enrollment.student.id]"
                              (click)="$event.stopPropagation()"
                              class="cell-primary-link"
                            >
                              {{ enrollment.student.name }}
                            </a>
                            <span class="cell-sub">{{ enrollment.student.email }}</span>
                          </div>
                        </div>
                      } @else {
                        <span class="text-muted">Unlinked Student</span>
                      }
                    </td>
                    <td>
                      @if (enrollment.course) {
                        <div class="cell-text">
                          <a
                            [routerLink]="['/courses', enrollment.course.id]"
                            (click)="$event.stopPropagation()"
                            class="cell-primary-link"
                          >
                            {{ enrollment.course.name }}
                          </a>
                          <span class="cell-sub">{{ enrollment.course.code }} &bull; {{ enrollment.course.instructor }}</span>
                        </div>
                      } @else {
                        <span class="text-muted">Unlinked Course</span>
                      }
                    </td>
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
                      <div class="action-btn-group" (click)="$event.stopPropagation()">
                        <a
                          [routerLink]="['/enrollments', enrollment.id]"
                          class="btn-icon"
                          title="View Details"
                        >
                          <app-icon name="eye" [size]="16"></app-icon>
                        </a>
                        <a
                          [routerLink]="['/enrollments/edit', enrollment.id]"
                          class="btn-icon"
                          title="Edit Enrollment"
                        >
                          <app-icon name="pencil" [size]="16"></app-icon>
                        </a>
                        @if (enrollment.status === 'Active') {
                          <button
                            type="button"
                            class="btn-icon text-warning"
                            title="Cancel Enrollment"
                            (click)="promptCancel(enrollment)"
                          >
                            <app-icon name="x" [size]="16"></app-icon>
                          </button>
                        }
                        <button
                          type="button"
                          class="btn-icon text-danger"
                          title="Delete Enrollment"
                          (click)="promptDelete(enrollment)"
                        >
                          <app-icon name="trash-2" [size]="16"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Card List -->
          <div class="mobile-card-list">
            @for (enrollment of pagedEnrollments; track enrollment.id) {
              <div class="mobile-data-card clickable-card" (click)="navigateToDetail(enrollment.id)">
                <div class="mobile-data-card-header">
                  <div>
                    <span class="mono-id">{{ enrollment.id }}</span>
                    <h4 class="mt-1">{{ enrollment.student?.name }}</h4>
                    <span class="cell-sub">{{ enrollment.course?.name }}</span>
                  </div>
                  <app-status-badge [status]="enrollment.status"></app-status-badge>
                </div>

                <div class="mobile-data-card-body">
                  <div class="mobile-data-card-item">
                    <span class="label">Date</span>
                    <span class="val">{{ enrollment.enrollmentDate | date: 'shortDate' }}</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Payment</span>
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

                <div class="mobile-data-card-actions" (click)="$event.stopPropagation()">
                  <a [routerLink]="['/enrollments', enrollment.id]" class="btn btn-outline btn-sm">
                    <app-icon name="eye" [size]="14"></app-icon>
                    <span>View</span>
                  </a>
                  <a [routerLink]="['/enrollments/edit', enrollment.id]" class="btn btn-outline btn-sm">
                    <app-icon name="pencil" [size]="14"></app-icon>
                    <span>Edit</span>
                  </a>
                  @if (enrollment.status === 'Active') {
                    <button
                      type="button"
                      class="btn btn-outline btn-sm text-warning"
                      (click)="promptCancel(enrollment)"
                    >
                      <app-icon name="x" [size]="14"></app-icon>
                      <span>Cancel</span>
                    </button>
                  }
                  <button
                    type="button"
                    class="btn btn-outline btn-sm text-danger"
                    (click)="promptDelete(enrollment)"
                  >
                    <app-icon name="trash-2" [size]="14"></app-icon>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          <app-pagination
            [currentPage]="currentPage"
            [pageSize]="pageSize"
            [totalItems]="filteredEnrollments.length"
            (pageChange)="onPageChange($event)"
          ></app-pagination>
        }
      </div>

      <!-- Cancel Enrollment Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isCancelModalOpen"
        title="Cancel Enrollment?"
        [message]="'Are you sure you want to cancel the enrollment for ' + (selectedEnrollment?.student?.name || 'this student') + ' in ' + (selectedEnrollment?.course?.name || 'this course') + '?'"
        details="Cancelling will update status to Cancelled and restore seat availability in the course."
        confirmText="Confirm Cancellation"
        variant="warning"
        [loading]="isActionLoading"
        (confirm)="confirmCancel()"
        (cancel)="closeCancelModal()"
      ></app-confirm-modal>

      <!-- Delete Enrollment Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Enrollment Record?"
        [message]="'Permanently delete enrollment ' + (selectedEnrollment?.id || '') + '?'"
        details="This will permanently delete the enrollment history record and recalculate available seats."
        confirmText="Delete Record"
        variant="danger"
        [loading]="isActionLoading"
        (confirm)="confirmDelete()"
        (cancel)="closeDeleteModal()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [
    `
      .page-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.25rem;
      }
      .page-header h2 {
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.015em;
      }
      .page-header p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
      }

      .toolbar-card {
        padding: 1.125rem 1.35rem;
      }

      .toolbar-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.875rem;
      }

      .search-input-wrap {
        position: relative;
        flex: 1;
        min-width: 260px;
        max-width: 400px;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        color: var(--text-muted);
        pointer-events: none;
      }

      .search-field {
        padding-left: 2.25rem;
        padding-right: 2rem;
        height: 38px;
        font-size: 0.875rem;
      }

      .btn-clear-search {
        position: absolute;
        right: 0.65rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.2rem;
      }

      .filter-controls {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        flex-wrap: wrap;
      }

      .select-filter {
        width: auto;
        min-width: 140px;
        height: 38px;
        font-size: 0.8125rem;
      }

      .table-card {
        overflow: hidden;
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .table-avatar {
        width: 34px;
        height: 34px;
        border-radius: var(--radius-full);
        object-fit: cover;
      }

      .cell-text {
        display: flex;
        flex-direction: column;
      }

      .cell-primary-link {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
      }
      .cell-primary-link:hover {
        color: var(--primary);
      }

      .cell-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .mono-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--primary);
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

      .action-btn-group {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.35rem;
      }

      .text-warning {
        color: var(--warning);
      }
      .text-warning:hover {
        background: var(--warning-light);
      }

      .text-danger {
        color: var(--danger);
      }
      .text-danger:hover {
        background: var(--danger-light);
      }

      @media (max-width: 768px) {
        .toolbar-card {
          padding: 0.75rem;
        }
        .toolbar-body {
          flex-direction: column;
          align-items: stretch;
          gap: 0.625rem;
        }
        .search-input-wrap {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }
        .filter-controls {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 0.5rem;
        }
        .select-filter {
          width: 100%;
          min-width: 0;
        }
      }
    `,
  ],
})
export class EnrollmentListComponent implements OnInit {
  private enrollmentService = inject(EnrollmentService);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  allEnrollments: EnrollmentWithDetails[] = [];
  filteredEnrollments: EnrollmentWithDetails[] = [];
  pagedEnrollments: EnrollmentWithDetails[] = [];
  courses: Course[] = [];

  isLoading = true;
  searchQuery = '';
  courseFilter = 'All';
  statusFilter: EnrollmentStatus | 'All' = 'All';
  paymentFilter: PaymentStatus | 'All' = 'All';

  currentPage = 1;
  pageSize = 8;

  // Modals state
  isCancelModalOpen = false;
  isDeleteModalOpen = false;
  selectedEnrollment: EnrollmentWithDetails | null = null;
  isActionLoading = false;

  get isFiltered(): boolean {
    return (
      !!this.searchQuery.trim() ||
      this.courseFilter !== 'All' ||
      this.statusFilter !== 'All' ||
      this.paymentFilter !== 'All'
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.enrollmentService.getEnrollments().subscribe((enrollments) => {
      this.allEnrollments = enrollments;
      this.applyFilter();
      this.isLoading = false;
      this.cdr.markForCheck();
    });

    this.courseService.courses$.subscribe((courses) => {
      this.courses = courses;
      this.cdr.markForCheck();
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allEnrollments];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          (e.student && e.student.name.toLowerCase().includes(q)) ||
          (e.student && e.student.email.toLowerCase().includes(q)) ||
          (e.course && e.course.name.toLowerCase().includes(q)) ||
          (e.course && e.course.code.toLowerCase().includes(q))
      );
    }

    if (this.courseFilter !== 'All') {
      result = result.filter((e) => e.courseId === this.courseFilter);
    }

    if (this.statusFilter !== 'All') {
      result = result.filter((e) => e.status === this.statusFilter);
    }

    if (this.paymentFilter !== 'All') {
      result = result.filter((e) => e.paymentStatus === this.paymentFilter);
    }

    this.filteredEnrollments = result;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEnrollments = this.filteredEnrollments.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.courseFilter = 'All';
    this.statusFilter = 'All';
    this.paymentFilter = 'All';
    this.currentPage = 1;
    this.applyFilter();
  }

  promptCancel(enrollment: EnrollmentWithDetails): void {
    this.selectedEnrollment = enrollment;
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.selectedEnrollment = null;
    this.isActionLoading = false;
  }

  confirmCancel(): void {
    if (!this.selectedEnrollment) return;

    this.isActionLoading = true;
    this.enrollmentService.cancelEnrollment(this.selectedEnrollment.id).subscribe({
      next: () => {
        this.closeCancelModal();
        this.loadData();
      },
      error: () => {
        this.isActionLoading = false;
      },
    });
  }

  promptDelete(enrollment: EnrollmentWithDetails): void {
    this.selectedEnrollment = enrollment;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedEnrollment = null;
    this.isActionLoading = false;
  }

  confirmDelete(): void {
    if (!this.selectedEnrollment) return;

    this.isActionLoading = true;
    this.enrollmentService.deleteEnrollment(this.selectedEnrollment.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadData();
      },
      error: () => {
        this.isActionLoading = false;
      },
    });
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/enrollments', id]);
  }
}

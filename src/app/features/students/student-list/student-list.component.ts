import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { Student, StudentStatus, Gender } from '../../../core/models/student.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-student-list',
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
      <!-- Page Header & Action -->
      <div class="page-header">
        <div>
          <h2>Student Management</h2>
          <p>Register, track, and manage student enrollments and academic records.</p>
        </div>
        <a routerLink="/students/add" class="btn btn-primary">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Add New Student</span>
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
              placeholder="Search by name, email, student ID..."
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
            <!-- Status Filter -->
            <select
              class="form-control select-filter"
              [(ngModel)]="statusFilter"
              (ngModelChange)="onFilterChange()"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <!-- Gender Filter -->
            <select
              class="form-control select-filter"
              [(ngModel)]="genderFilter"
              (ngModelChange)="onFilterChange()"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <!-- Reset Filters -->
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
        } @else if (pagedStudents.length === 0) {
          <app-empty-state
            icon="users"
            title="No students found"
            [message]="
              isFiltered
                ? 'No students matched your active filter criteria. Try clearing search filters.'
                : 'There are currently no students registered in the system.'
            "
            [actionText]="isFiltered ? 'Reset Filters' : 'Add New Student'"
            (action)="isFiltered ? resetFilters() : navigateToAdd()"
          ></app-empty-state>
        } @else {
          <!-- Desktop Data Table -->
          <div class="desktop-table-view table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Contact Info</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Enrolled Courses</th>
                  <th>Joined Date</th>
                  <th style="text-align: right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (student of pagedStudents; track student.id) {
                  <tr (click)="navigateToDetail(student.id)" class="clickable-row">
                    <td>
                      <div class="student-cell">
                        <img
                          [src]="student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'"
                          alt="Avatar"
                          class="table-avatar"
                        />
                        <div class="cell-text">
                          <a [routerLink]="['/students', student.id]" class="cell-primary-link">
                            {{ student.name }}
                          </a>
                          <span class="cell-sub">{{ student.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        [routerLink]="['/students', student.id]"
                        (click)="$event.stopPropagation()"
                        class="mono-id hover-link"
                      >
                        {{ student.id }}
                      </a>
                    </td>
                    <td>
                      <div class="cell-text">
                        <span>{{ student.phone }}</span>
                        <span class="cell-sub truncate-address">{{ student.address }}</span>
                      </div>
                    </td>
                    <td>{{ student.gender }}</td>
                    <td>
                      <app-status-badge [status]="student.status"></app-status-badge>
                    </td>
                    <td>
                      <span class="enrollment-count-badge">
                        {{ getActiveEnrollmentCount(student.id) }} active
                      </span>
                    </td>
                    <td>{{ student.createdAt | date: 'mediumDate' }}</td>
                    <td style="text-align: right">
                      <div class="action-btn-group" (click)="$event.stopPropagation()">
                        <a
                          [routerLink]="['/students', student.id]"
                          class="btn-icon"
                          title="View Profile"
                        >
                          <app-icon name="eye" [size]="16"></app-icon>
                        </a>
                        <a
                          [routerLink]="['/students/edit', student.id]"
                          class="btn-icon"
                          title="Edit Student"
                        >
                          <app-icon name="pencil" [size]="16"></app-icon>
                        </a>
                        <button
                          type="button"
                          class="btn-icon text-danger"
                          title="Delete Student"
                          (click)="promptDelete(student)"
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

          <!-- Mobile Card View -->
          <div class="mobile-card-list">
            @for (student of pagedStudents; track student.id) {
              <div class="mobile-data-card clickable-card" (click)="navigateToDetail(student.id)">
                <div class="mobile-data-card-header">
                  <div class="student-cell">
                    <img
                      [src]="student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'"
                      alt="Avatar"
                      class="table-avatar"
                    />
                    <div>
                      <h4 class="student-name-mobile">{{ student.name }}</h4>
                      <span class="mono-id">{{ student.id }}</span>
                    </div>
                  </div>
                  <app-status-badge [status]="student.status"></app-status-badge>
                </div>

                <div class="mobile-data-card-body">
                  <div class="mobile-data-card-item">
                    <span class="label">Email</span>
                    <span class="val truncate">{{ student.email }}</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Phone</span>
                    <span class="val">{{ student.phone }}</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Enrollments</span>
                    <span class="val">{{ getActiveEnrollmentCount(student.id) }} courses</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Joined</span>
                    <span class="val">{{ student.createdAt | date: 'shortDate' }}</span>
                  </div>
                </div>

                <div class="mobile-data-card-actions" (click)="$event.stopPropagation()">
                  <a [routerLink]="['/students', student.id]" class="btn btn-outline btn-sm">
                    <app-icon name="eye" [size]="14"></app-icon>
                    <span>View</span>
                  </a>
                  <a [routerLink]="['/students/edit', student.id]" class="btn btn-outline btn-sm">
                    <app-icon name="pencil" [size]="14"></app-icon>
                    <span>Edit</span>
                  </a>
                  <button
                    type="button"
                    class="btn btn-outline btn-sm text-danger"
                    (click)="promptDelete(student)"
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
            [totalItems]="filteredStudents.length"
            (pageChange)="onPageChange($event)"
          ></app-pagination>
        }
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Student Record?"
        [message]="'Are you sure you want to permanently remove ' + (studentToDelete?.name || 'this student') + '?'"
        [details]="studentToDelete ? 'Student ID: ' + studentToDelete.id + ' | Email: ' + studentToDelete.email : undefined"
        confirmText="Delete Student"
        variant="danger"
        [loading]="isDeleting"
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
        max-width: 440px;
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
        width: 36px;
        height: 36px;
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

      .truncate-address {
        max-width: 180px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .mono-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--primary);
      }

      .enrollment-count-badge {
        font-size: 0.75rem;
        background: var(--surface-secondary);
        color: var(--text-secondary);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-full);
        font-weight: 500;
      }

      .action-btn-group {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.35rem;
      }

      .text-danger {
        color: var(--danger);
      }
      .text-danger:hover {
        background: var(--danger-light);
        color: var(--danger);
      }

      .student-name-mobile {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  allStudents: Student[] = [];
  filteredStudents: Student[] = [];
  pagedStudents: Student[] = [];

  isLoading = true;
  searchQuery = '';
  statusFilter: StudentStatus | 'All' = 'All';
  genderFilter: Gender | 'All' = 'All';

  currentPage = 1;
  pageSize = 8;

  // Active enrollments lookup cache
  private enrollmentCounts: Record<string, number> = {};

  // Delete modal state
  isDeleteModalOpen = false;
  studentToDelete: Student | null = null;
  isDeleting = false;

  get isFiltered(): boolean {
    return (
      !!this.searchQuery.trim() ||
      this.statusFilter !== 'All' ||
      this.genderFilter !== 'All'
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.studentService.students$.subscribe((students) => {
      this.allStudents = students;
      this.applyFilter();
      this.isLoading = false;
      this.cdr.markForCheck();
    });

    this.enrollmentService.enrollments$.subscribe((enrollments) => {
      const counts: Record<string, number> = {};
      enrollments.forEach((e) => {
        if (e.status === 'Active') {
          counts[e.studentId] = (counts[e.studentId] || 0) + 1;
        }
      });
      this.enrollmentCounts = counts;
      this.cdr.markForCheck();
    });
  }

  getActiveEnrollmentCount(studentId: string): number {
    return this.enrollmentCounts[studentId] || 0;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allStudents];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }

    if (this.statusFilter !== 'All') {
      result = result.filter((s) => s.status === this.statusFilter);
    }

    if (this.genderFilter !== 'All') {
      result = result.filter((s) => s.gender === this.genderFilter);
    }

    this.filteredStudents = result;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedStudents = this.filteredStudents.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.genderFilter = 'All';
    this.currentPage = 1;
    this.applyFilter();
  }

  navigateToAdd(): void {
    // routerLink handled in template
  }

  promptDelete(student: Student): void {
    this.studentToDelete = student;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.studentToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.studentToDelete) return;

    this.isDeleting = true;
    this.studentService.deleteStudent(this.studentToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/students', id]);
  }
}

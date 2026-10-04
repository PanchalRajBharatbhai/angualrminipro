import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { Course, CourseStatus } from '../../../core/models/course.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CourseDurationPipe } from '../../../shared/pipes/course-duration.pipe';
import { SeatAvailabilityPipe } from '../../../shared/pipes/seat-availability.pipe';

@Component({
  selector: 'app-course-list',
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
    CourseDurationPipe,
    SeatAvailabilityPipe,
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>Course Management</h2>
          <p>Configure course offerings, faculty assignments, and seat capacities.</p>
        </div>
        <a routerLink="/courses/add" class="btn btn-primary">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Add New Course</span>
        </a>
      </div>

      <!-- Filters Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-body">
          <div class="search-input-wrap">
            <app-icon name="search" [size]="16" class="search-icon"></app-icon>
            <input
              type="text"
              class="form-control search-field"
              placeholder="Search by course name, code, or instructor..."
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
            <!-- Category Filter -->
            <select
              class="form-control select-filter"
              [(ngModel)]="categoryFilter"
              (ngModelChange)="onFilterChange()"
            >
              <option value="All">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
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
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Inactive">Inactive</option>
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

      <!-- Course Table / Cards -->
      <div class="card table-card">
        @if (isLoading) {
          <app-loading-skeleton type="table"></app-loading-skeleton>
        } @else if (pagedCourses.length === 0) {
          <app-empty-state
            icon="book-open"
            title="No courses found"
            [message]="
              isFiltered
                ? 'No courses matched your query. Adjust search or category filters.'
                : 'There are currently no courses in the catalogue.'
            "
            [actionText]="isFiltered ? 'Reset Filters' : 'Add Course'"
            (action)="isFiltered ? resetFilters() : null"
          ></app-empty-state>
        } @else {
          <!-- Desktop Table -->
          <div class="desktop-table-view table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Course Code & Name</th>
                  <th>Category</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Tuition Fee</th>
                  <th>Seat Capacity</th>
                  <th>Status</th>
                  <th style="text-align: right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (course of pagedCourses; track course.id) {
                  <tr (click)="navigateToDetail(course.id)" class="clickable-row">
                    <td>
                      <div class="course-name-cell">
                        <span class="mono-code">{{ course.code }}</span>
                        <a [routerLink]="['/courses', course.id]" class="cell-primary-link">
                          {{ course.name }}
                        </a>
                      </div>
                    </td>
                    <td>
                      <span class="category-pill">{{ course.category }}</span>
                    </td>
                    <td>{{ course.instructor }}</td>
                    <td>{{ course.duration | courseDuration }}</td>
                    <td>{{ course.fee | currency: 'INR': 'symbol': '1.0-0' }}</td>
                    <td style="min-width: 170px">
                      <div class="capacity-cell">
                        <div class="capacity-text">
                          <span class="seats-val">
                            {{ course.availableSeats }} / {{ course.capacity }} seats left
                          </span>
                        </div>
                        <div class="capacity-progress">
                          <div
                            class="capacity-progress-fill"
                            [style.width.%]="getOccupancyPercent(course)"
                            [ngClass]="getCapacityFillClass(course)"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <app-status-badge [status]="course.status"></app-status-badge>
                    </td>
                    <td style="text-align: right">
                      <div class="action-btn-group" (click)="$event.stopPropagation()">
                        <a
                          [routerLink]="['/courses', course.id]"
                          class="btn-icon"
                          title="View Course Details"
                        >
                          <app-icon name="eye" [size]="16"></app-icon>
                        </a>
                        <a
                          [routerLink]="['/courses/edit', course.id]"
                          class="btn-icon"
                          title="Edit Course"
                        >
                          <app-icon name="pencil" [size]="16"></app-icon>
                        </a>
                        <button
                          type="button"
                          class="btn-icon text-danger"
                          title="Delete Course"
                          (click)="promptDelete(course)"
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
            @for (course of pagedCourses; track course.id) {
              <div class="mobile-data-card clickable-card" (click)="navigateToDetail(course.id)">
                <div class="mobile-data-card-header">
                  <div>
                    <span class="mono-code">{{ course.code }}</span>
                    <h4 class="mt-1">{{ course.name }}</h4>
                    <span class="cell-sub">{{ course.instructor }}</span>
                  </div>
                  <app-status-badge [status]="course.status"></app-status-badge>
                </div>

                <div class="mobile-data-card-body">
                  <div class="mobile-data-card-item">
                    <span class="label">Category</span>
                    <span class="val">{{ course.category }}</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Tuition Fee</span>
                    <span class="val">{{ course.fee | currency: 'INR': 'symbol': '1.0-0' }}</span>
                  </div>
                  <div class="mobile-data-card-item" style="grid-column: span 2">
                    <span class="label">Available Seats</span>
                    <span class="val">
                      {{ course.availableSeats | seatAvailability: course.capacity }}
                    </span>
                    <div class="capacity-progress mt-1">
                      <div
                        class="capacity-progress-fill"
                        [style.width.%]="getOccupancyPercent(course)"
                        [ngClass]="getCapacityFillClass(course)"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="mobile-data-card-actions" (click)="$event.stopPropagation()">
                  <a [routerLink]="['/courses', course.id]" class="btn btn-outline btn-sm">
                    <app-icon name="eye" [size]="14"></app-icon>
                    <span>View</span>
                  </a>
                  <a [routerLink]="['/courses/edit', course.id]" class="btn btn-outline btn-sm">
                    <app-icon name="pencil" [size]="14"></app-icon>
                    <span>Edit</span>
                  </a>
                  <button
                    type="button"
                    class="btn btn-outline btn-sm text-danger"
                    (click)="promptDelete(course)"
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
            [totalItems]="filteredCourses.length"
            (pageChange)="onPageChange($event)"
          ></app-pagination>
        }
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Course?"
        [message]="'Are you sure you want to delete ' + (courseToDelete?.name || 'this course') + '?'"
        [details]="courseToDelete ? 'Course Code: ' + courseToDelete.code + ' | Capacity: ' + courseToDelete.capacity : undefined"
        confirmText="Delete Course"
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

      .course-name-cell {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .mono-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary);
      }

      .cell-primary-link {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
      }
      .cell-primary-link:hover {
        color: var(--primary);
      }

      .category-pill {
        display: inline-block;
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        background: var(--surface-secondary);
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
      }

      .capacity-cell {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .capacity-text {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .seats-val {
        font-size: 0.775rem;
        color: var(--text-secondary);
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
      }

      .cell-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .mt-1 {
        margin-top: 0.25rem;
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
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  pagedCourses: Course[] = [];
  categories: string[] = [];

  isLoading = true;
  searchQuery = '';
  categoryFilter = 'All';
  statusFilter: CourseStatus | 'All' = 'All';

  currentPage = 1;
  pageSize = 8;

  isDeleteModalOpen = false;
  courseToDelete: Course | null = null;
  isDeleting = false;

  get isFiltered(): boolean {
    return (
      !!this.searchQuery.trim() ||
      this.categoryFilter !== 'All' ||
      this.statusFilter !== 'All'
    );
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.courses$.subscribe((courses) => {
      this.allCourses = courses;
      this.categories = Array.from(new Set(courses.map((c) => c.category))).sort();
      this.applyFilter();
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allCourses];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (this.categoryFilter !== 'All') {
      result = result.filter((c) => c.category === this.categoryFilter);
    }

    if (this.statusFilter !== 'All') {
      result = result.filter((c) => c.status === this.statusFilter);
    }

    this.filteredCourses = result;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedCourses = this.filteredCourses.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.categoryFilter = 'All';
    this.statusFilter = 'All';
    this.currentPage = 1;
    this.applyFilter();
  }

  getOccupancyPercent(course: Course): number {
    if (course.capacity <= 0) return 100;
    const occupied = course.capacity - course.availableSeats;
    return Math.min(100, Math.round((occupied / course.capacity) * 100));
  }

  getCapacityFillClass(course: Course): string {
    const pct = this.getOccupancyPercent(course);
    if (pct >= 90) return 'full';
    if (pct >= 70) return 'warn';
    return 'safe';
  }

  promptDelete(course: Course): void {
    this.courseToDelete = course;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.courseToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.courseToDelete) return;

    this.isDeleting = true;
    this.courseService.deleteCourse(this.courseToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/courses', id]);
  }
}

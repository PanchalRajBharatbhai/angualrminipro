import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    StatusBadgeComponent,
    IconComponent,
    LoadingSkeletonComponent,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome & Quick Action Bar -->
      <div class="dashboard-banner">
        <div class="banner-text">
          <h2>Academic Management Overview</h2>
          <p>Real-time enrollment metrics, seat occupancy, and curriculum monitoring.</p>
        </div>
        <div class="quick-actions">
          <a routerLink="/students/add" class="btn btn-outline btn-sm">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>Add Student</span>
          </a>
          <a routerLink="/courses/add" class="btn btn-outline btn-sm">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>Add Course</span>
          </a>
          <a routerLink="/enrollments/add" class="btn btn-primary btn-sm">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>New Enrollment</span>
          </a>
        </div>
      </div>

      <!-- Main Statistics Grid -->
      @if (stats$ | async; as stats) {
        <div class="stats-grid">
          <app-stat-card
            title="Total Students"
            [value]="stats.totalStudents"
            icon="users"
            variant="primary"
            change="+8.2%"
            subtext="Registered students"
            trend="up"
          ></app-stat-card>

          <app-stat-card
            title="Total Courses"
            [value]="stats.totalCourses"
            icon="book-open"
            variant="info"
            subtext="Curriculum catalogue"
          ></app-stat-card>

          <app-stat-card
            title="Total Enrollments"
            [value]="stats.totalEnrollments"
            icon="clipboard-list"
            variant="success"
            change="+12.4%"
            subtext="Active records"
            trend="up"
          ></app-stat-card>

          <app-stat-card
            title="Active Courses"
            [value]="stats.activeCourses"
            icon="bar-chart-3"
            variant="warning"
            subtext="Currently in session"
          ></app-stat-card>

          <app-stat-card
            title="Available Seats"
            [value]="stats.availableSeats"
            icon="clock"
            [variant]="stats.availableSeats > 5 ? 'success' : 'warning'"
            [subtext]="stats.availableSeats + ' of ' + stats.totalCapacity + ' total capacity'"
          ></app-stat-card>
        </div>

        <!-- Analytical Panels (Capacity & Popular Courses) -->
        <div class="analytics-row">
          <!-- Capacity Utilization Card -->
          <div class="card capacity-card">
            <div class="card-header">
              <div class="header-title-wrap">
                <app-icon name="bar-chart" [size]="18" class="text-primary"></app-icon>
                <h3>Seat Capacity Utilization</h3>
              </div>
              <span class="badge badge-active">{{ stats.capacityUtilization }}% Occupied</span>
            </div>
            <div class="card-body">
              <div class="utilization-gauge">
                <div class="gauge-bar-wrapper">
                  <div class="capacity-progress lg">
                    <div
                      class="capacity-progress-fill"
                      [style.width.%]="stats.capacityUtilization"
                      [ngClass]="getCapacityColor(stats.capacityUtilization)"
                    ></div>
                  </div>
                </div>
                <div class="gauge-legend">
                  <div class="legend-item">
                    <span class="legend-color occupied"></span>
                    <span class="legend-text">
                      Enrolled: <strong>{{ stats.totalCapacity - stats.availableSeats }}</strong>
                    </span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color available"></span>
                    <span class="legend-text">
                      Available: <strong>{{ stats.availableSeats }}</strong>
                    </span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color total"></span>
                    <span class="legend-text">
                      Total Capacity: <strong>{{ stats.totalCapacity }}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Enrollment Status Distribution Pills -->
              <div class="status-summary-bar">
                <div class="status-summary-item active">
                  <span class="num">{{ stats.statusBreakdown.active }}</span>
                  <span class="lbl">Active</span>
                </div>
                <div class="status-summary-item completed">
                  <span class="num">{{ stats.statusBreakdown.completed }}</span>
                  <span class="lbl">Completed</span>
                </div>
                <div class="status-summary-item cancelled">
                  <span class="num">{{ stats.statusBreakdown.cancelled }}</span>
                  <span class="lbl">Cancelled</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Courses Card -->
          <div class="card popular-card">
            <div class="card-header">
              <div class="header-title-wrap">
                <app-icon name="trending-up" [size]="18" class="text-primary"></app-icon>
                <h3>High-Demand Courses</h3>
              </div>
              <a routerLink="/courses" class="card-action-link">View Catalogue</a>
            </div>
            <div class="card-body p-0">
              <ul class="popular-list">
                @for (item of stats.popularCourses; track item.course.id) {
                  <li class="popular-item clickable-item" (click)="navigateToCourse(item.course.id)">
                    <div class="course-info">
                      <a [routerLink]="['/courses', item.course.id]" (click)="$event.stopPropagation()" class="course-name">
                        {{ item.course.name }}
                      </a>
                      <span class="course-sub">{{ item.course.code }} &bull; {{ item.course.instructor }}</span>
                    </div>
                    <div class="course-enrollment-meta">
                      <span class="enrollment-pill">
                        <strong>{{ item.enrollmentCount }}</strong> / {{ item.course.capacity }}
                      </span>
                      <span class="seats-left" [class.warning]="item.course.availableSeats <= 2">
                        {{ item.course.availableSeats }} left
                      </span>
                    </div>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>

        <!-- Recent Enrollments Table -->
        <div class="card table-card">
          <div class="card-header">
            <div class="header-title-wrap">
              <app-icon name="clipboard-list" [size]="18" class="text-primary"></app-icon>
              <h3>Recent Enrollments</h3>
            </div>
            <a routerLink="/enrollments" class="btn btn-outline btn-sm">
              <span>View All Enrollments</span>
              <app-icon name="chevron-right" [size]="14"></app-icon>
            </a>
          </div>

          <!-- Desktop Table -->
          <div class="desktop-table-view table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style="text-align: right">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (enrollment of stats.recentEnrollments; track enrollment.id) {
                  <tr (click)="navigateToEnrollment(enrollment.id)" class="clickable-row">
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
                            [src]="enrollment.student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'"
                            alt="Avatar"
                            class="table-avatar"
                          />
                          <div class="cell-text">
                            <a [routerLink]="['/students', enrollment.student.id]" class="cell-primary-link">
                              {{ enrollment.student.name }}
                            </a>
                            <span class="cell-sub">{{ enrollment.student.id }}</span>
                          </div>
                        </div>
                      } @else {
                        <span class="text-muted">Unknown Student</span>
                      }
                    </td>
                    <td>
                      @if (enrollment.course) {
                        <div class="cell-text">
                          <a [routerLink]="['/courses', enrollment.course.id]" class="cell-primary-link">
                            {{ enrollment.course.name }}
                          </a>
                          <span class="cell-sub">{{ enrollment.course.code }}</span>
                        </div>
                      } @else {
                        <span class="text-muted">Unknown Course</span>
                      }
                    </td>
                    <td>{{ enrollment.enrollmentDate | date: 'mediumDate' }}</td>
                    <td>
                      <app-status-badge [status]="enrollment.paymentStatus"></app-status-badge>
                    </td>
                    <td>
                      <app-status-badge [status]="enrollment.status"></app-status-badge>
                    </td>
                    <td style="text-align: right">
                      <a
                        [routerLink]="['/enrollments', enrollment.id]"
                        (click)="$event.stopPropagation()"
                        class="btn-icon"
                        title="View details"
                      >
                        <app-icon name="eye" [size]="16"></app-icon>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Card List for Responsive 320px-768px -->
          <div class="mobile-card-list">
            @for (enrollment of stats.recentEnrollments; track enrollment.id) {
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
                    <span class="label">Course</span>
                    <span class="val">{{ enrollment.course?.name }}</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Enrolled Date</span>
                    <span class="val">{{ enrollment.enrollmentDate | date: 'shortDate' }}</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Payment</span>
                    <span class="val">{{ enrollment.paymentStatus }}</span>
                  </div>
                </div>
                <div class="mobile-data-card-actions">
                  <a [routerLink]="['/enrollments', enrollment.id]" class="btn btn-outline btn-sm">
                    <app-icon name="eye" [size]="14"></app-icon>
                    <span>View Details</span>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <app-loading-skeleton type="card"></app-loading-skeleton>
        <div style="margin-top: 1.5rem">
          <app-loading-skeleton type="table"></app-loading-skeleton>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .dashboard-banner {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.25rem;
        box-shadow: var(--shadow-sm);
      }

      .banner-text h2 {
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }
      .banner-text p {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-top: 0.35rem;
      }

      .quick-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 1.25rem;
        align-items: stretch;
      }

      .analytics-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.75rem;
      }
      @media (max-width: 900px) {
        .analytics-row {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      .header-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .header-title-wrap h3 {
        font-size: 1rem;
        font-weight: 600;
      }

      .capacity-progress.lg {
        height: 10px;
      }

      .utilization-gauge {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
      }

      .gauge-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem 1rem;
      }

      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        white-space: nowrap;
      }

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: var(--radius-xs);
        flex-shrink: 0;
      }
      .legend-color.occupied { background: var(--primary); }
      .legend-color.available { background: var(--success); }
      .legend-color.total { background: var(--surface-tertiary); }

      .status-summary-bar {
        margin-top: 1.25rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.625rem;
        text-align: center;
      }

      .status-summary-item {
        display: flex;
        flex-direction: column;
        padding: 0.5rem 0.25rem;
        border-radius: var(--radius-md);
        background: var(--surface-secondary);
        min-width: 0;
        overflow: hidden;
      }
      .status-summary-item .num {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
      }
      .status-summary-item .lbl {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .popular-list {
        list-style: none;
        display: flex;
        flex-direction: column;
      }

      .popular-item {
        padding: 0.875rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border);
        gap: 0.75rem;
      }
      .popular-item.clickable-item {
        cursor: pointer;
        transition: background var(--transition-fast);
      }
      .popular-item.clickable-item:hover {
        background: var(--surface-hover);
      }
      .popular-item:last-child {
        border-bottom: none;
      }

      .course-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
        flex: 1;
      }

      .course-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
      }
      .course-name:hover {
        color: var(--primary);
      }

      .course-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .course-enrollment-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-shrink: 0;
        text-align: right;
      }

      .enrollment-pill {
        font-size: 0.8125rem;
        color: var(--text-primary);
        white-space: nowrap;
      }

      .seats-left {
        font-size: 0.72rem;
        color: var(--success);
        font-weight: 500;
        white-space: nowrap;
      }
      .seats-left.warning {
        color: var(--warning);
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .table-avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        object-fit: cover;
      }

      .cell-text {
        display: flex;
        flex-direction: column;
      }

      .cell-primary-link {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
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

      .card-action-link {
        font-size: 0.8125rem;
        color: var(--primary);
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
      }

      @media (max-width: 640px) {
        .dashboard-banner {
          padding: 1rem 0.875rem;
          flex-direction: column;
          align-items: stretch;
          gap: 0.875rem;
        }
        .quick-actions {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 0.5rem;
        }
        .quick-actions a {
          width: 100%;
          justify-content: center;
        }
        .stats-grid {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        .status-summary-bar {
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
        }
        .popular-item {
          padding: 0.75rem 0.875rem;
          gap: 0.5rem;
        }
      }

      @media (max-width: 480px) {
        .header-title-wrap h3 {
          font-size: 0.925rem;
        }
        .capacity-card .card-header,
        .popular-card .card-header {
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        .gauge-legend {
          gap: 0.4rem 0.625rem;
        }
        .legend-item {
          font-size: 0.75rem;
        }
        .status-summary-bar {
          gap: 0.35rem;
        }
        .status-summary-item {
          padding: 0.4rem 0.2rem;
        }
        .status-summary-item .num {
          font-size: 1.05rem;
        }
        .status-summary-item .lbl {
          font-size: 0.65rem;
          letter-spacing: 0;
        }
        .popular-item {
          padding: 0.625rem 0.75rem;
        }
        .course-name {
          font-size: 0.8125rem;
        }
        .course-sub {
          font-size: 0.7rem;
        }
        .enrollment-pill {
          font-size: 0.75rem;
        }
        .seats-left {
          font-size: 0.68rem;
        }
      }

      @media (max-width: 340px) {
        .header-title-wrap h3 {
          font-size: 0.875rem;
        }
        .gauge-legend {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
        }
        .gauge-legend .legend-item:last-child {
          grid-column: span 2;
        }
        .legend-item {
          font-size: 0.7188rem;
        }
        .status-summary-bar {
          gap: 0.25rem;
        }
        .status-summary-item {
          padding: 0.35rem 0.15rem;
        }
        .status-summary-item .num {
          font-size: 0.95rem;
        }
        .status-summary-item .lbl {
          font-size: 0.6rem;
        }
        .popular-item {
          padding: 0.5rem 0.5rem;
          gap: 0.35rem;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  stats$!: Observable<DashboardStats>;

  ngOnInit(): void {
    this.stats$ = this.dashboardService.getDashboardStats();
  }

  getCapacityColor(percent: number): string {
    if (percent >= 90) return 'full';
    if (percent >= 75) return 'warn';
    return 'safe';
  }

  navigateToEnrollment(id: string): void {
    this.router.navigate(['/enrollments', id]);
  }

  navigateToCourse(id: string): void {
    this.router.navigate(['/courses', id]);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { StudentService } from '../../core/services/student.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Course } from '../../core/models/course.model';
import { EnrollmentWithDetails } from '../../core/models/enrollment.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { NotificationService } from '../../core/services/notification.service';

interface CourseReportItem {
  course: Course;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  totalEnrollments: number;
  revenueGenerated: number;
  occupancyPercent: number;
}

interface AnalyticsReportData {
  totalRevenue: number;
  potentialRevenue: number;
  avgStudentsPerCourse: number;
  overallOccupancy: number;
  courseReports: CourseReportItem[];
  statusDistribution: {
    active: number;
    completed: number;
    cancelled: number;
  };
  paymentDistribution: {
    paid: number;
    pending: number;
    waived: number;
  };
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    StatusBadgeComponent,
    LoadingSkeletonComponent,
  ],
  template: `
    <div class="page-container">
      @if (reportData$ | async; as data) {
        <!-- Printable Official Letterhead (visible when printed to PDF) -->
        <div class="print-only-header">
          <div class="print-header-brand">
            <h1>EduEnroll Portal</h1>
            <p>Course Enrollment & Academic Management System</p>
          </div>
          <div class="print-header-meta">
            <strong>OFFICIAL INSTITUTIONAL ANALYTICS REPORT</strong>
            <span>Report Generated: {{ generatedDate | date: 'medium' }}</span>
          </div>
        </div>

        <!-- Header with Dual Export Options -->
        <div class="page-header no-print">
          <div>
            <h2>Enrollment Reports & Curriculum Analytics</h2>
            <p>Real-time institutional reporting on capacity metrics, seat distribution, and tuition yields.</p>
          </div>
          <div class="header-actions">
            <button type="button" class="btn btn-primary btn-sm export-btn" (click)="exportToCsv(data)">
              <app-icon name="download" [size]="15"></app-icon>
              <span>Export CSV (Excel)</span>
            </button>
            <button type="button" class="btn btn-outline btn-sm print-btn" (click)="printReport()">
              <app-icon name="printer" [size]="15"></app-icon>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
        <!-- High-Level Metric Tiles -->
        <div class="kpi-grid">
          <div class="card kpi-card">
            <span class="kpi-label">Total Realized Revenue</span>
            <span class="kpi-value text-primary">
              {{ data.totalRevenue | currency: 'INR': 'symbol': '1.0-0' }}
            </span>
            <span class="kpi-sub">From paid course registrations</span>
          </div>

          <div class="card kpi-card">
            <span class="kpi-label">Average Class Size</span>
            <span class="kpi-value">{{ data.avgStudentsPerCourse }} students</span>
            <span class="kpi-sub">Across active offerings</span>
          </div>

          <div class="card kpi-card">
            <span class="kpi-label">Overall Seat Occupancy</span>
            <span class="kpi-value text-success">{{ data.overallOccupancy }}%</span>
            <span class="kpi-sub">Capacity utilization index</span>
          </div>

          <div class="card kpi-card">
            <span class="kpi-label">Active vs Dropped</span>
            <span class="kpi-value">
              {{ data.statusDistribution.active }} / {{ data.statusDistribution.cancelled }}
            </span>
            <span class="kpi-sub">Active registrations / Cancellations</span>
          </div>
        </div>

        <!-- Distributions Row (Status & Payments) -->
        <div class="distributions-grid">
          <!-- Enrollment Status Breakdown -->
          <div class="card dist-card">
            <div class="card-header">
              <h3>Enrollment Lifecycle Status</h3>
            </div>
            <div class="card-body">
              <div class="status-bars">
                <div class="status-bar-row">
                  <div class="bar-header">
                    <span>Active Registrations</span>
                    <strong>{{ data.statusDistribution.active }}</strong>
                  </div>
                  <div class="capacity-progress">
                    <div
                      class="capacity-progress-fill safe"
                      [style.width.%]="getPercent(data.statusDistribution.active, getTotalEnrollments(data))"
                    ></div>
                  </div>
                </div>

                <div class="status-bar-row">
                  <div class="bar-header">
                    <span>Completed Alumni</span>
                    <strong>{{ data.statusDistribution.completed }}</strong>
                  </div>
                  <div class="capacity-progress">
                    <div
                      class="capacity-progress-fill info"
                      style="background: var(--info)"
                      [style.width.%]="getPercent(data.statusDistribution.completed, getTotalEnrollments(data))"
                    ></div>
                  </div>
                </div>

                <div class="status-bar-row">
                  <div class="bar-header">
                    <span>Cancelled / Dropped</span>
                    <strong>{{ data.statusDistribution.cancelled }}</strong>
                  </div>
                  <div class="capacity-progress">
                    <div
                      class="capacity-progress-fill full"
                      [style.width.%]="getPercent(data.statusDistribution.cancelled, getTotalEnrollments(data))"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tuition Payment Distribution -->
          <div class="card dist-card">
            <div class="card-header">
              <h3>Tuition Payment Allocation</h3>
            </div>
            <div class="card-body">
              <div class="status-bars">
                <div class="status-bar-row">
                  <div class="bar-header">
                    <span>Paid in Full</span>
                    <strong>{{ data.paymentDistribution.paid }}</strong>
                  </div>
                  <div class="capacity-progress">
                    <div
                      class="capacity-progress-fill safe"
                      [style.width.%]="getPercent(data.paymentDistribution.paid, getTotalEnrollments(data))"
                    ></div>
                  </div>
                </div>

                <div class="status-bar-row">
                  <div class="bar-header">
                    <span>Pending Payment</span>
                    <strong>{{ data.paymentDistribution.pending }}</strong>
                  </div>
                  <div class="capacity-progress">
                    <div
                      class="capacity-progress-fill warn"
                      [style.width.%]="getPercent(data.paymentDistribution.pending, getTotalEnrollments(data))"
                    ></div>
                  </div>
                </div>

                <div class="status-bar-row">
                  <div class="bar-header">
                    <span>Scholarship / Waived</span>
                    <strong>{{ data.paymentDistribution.waived }}</strong>
                  </div>
                  <div class="capacity-progress">
                    <div
                      class="capacity-progress-fill"
                      style="background: var(--text-muted)"
                      [style.width.%]="getPercent(data.paymentDistribution.waived, getTotalEnrollments(data))"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Course-Wise Analysis Table -->
        <div class="card table-card">
          <div class="card-header">
            <h3>Course-by-Course Enrollment & Seat Performance</h3>
            <span class="badge badge-inactive">{{ data.courseReports.length }} Offerings Audited</span>
          </div>

          <div class="desktop-table-view table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Course Code & Title</th>
                  <th>Faculty</th>
                  <th>Seat Occupancy</th>
                  <th>Active / Capacity</th>
                  <th>Available</th>
                  <th>Revenue Generated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (item of data.courseReports; track item.course.id) {
                  <tr>
                    <td>
                      <div class="cell-text">
                        <span class="mono-code">{{ item.course.code }}</span>
                        <a [routerLink]="['/courses', item.course.id]" class="cell-primary-link">
                          {{ item.course.name }}
                        </a>
                      </div>
                    </td>
                    <td>{{ item.course.instructor }}</td>
                    <td style="min-width: 150px">
                      <div class="occupancy-progress-wrap">
                        <div class="occupancy-text">
                          <span>{{ item.occupancyPercent }}%</span>
                        </div>
                        <div class="capacity-progress">
                          <div
                            class="capacity-progress-fill"
                            [style.width.%]="item.occupancyPercent"
                            [ngClass]="item.occupancyPercent >= 90 ? 'full' : item.occupancyPercent >= 70 ? 'warn' : 'safe'"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{{ item.activeCount }}</strong> / {{ item.course.capacity }}
                    </td>
                    <td>
                      <span [class.text-danger]="item.course.availableSeats <= 0" [class.text-success]="item.course.availableSeats > 0">
                        {{ item.course.availableSeats }} seats
                      </span>
                    </td>
                    <td class="font-semibold text-primary">
                      {{ item.revenueGenerated | currency: 'INR': 'symbol': '1.0-0' }}
                    </td>
                    <td>
                      <app-status-badge [status]="item.course.status"></app-status-badge>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards for Reports -->
          <div class="mobile-card-list p-3">
            @for (item of data.courseReports; track item.course.id) {
              <div class="mobile-data-card">
                <div class="mobile-data-card-header">
                  <div>
                    <span class="mono-code">{{ item.course.code }}</span>
                    <h4 class="mt-1">{{ item.course.name }}</h4>
                  </div>
                  <app-status-badge [status]="item.course.status"></app-status-badge>
                </div>
                <div class="mobile-data-card-body">
                  <div class="mobile-data-card-item">
                    <span class="label">Occupancy</span>
                    <span class="val">{{ item.occupancyPercent }}%</span>
                  </div>
                  <div class="mobile-data-card-item">
                    <span class="label">Seats Left</span>
                    <span class="val">{{ item.course.availableSeats }} / {{ item.course.capacity }}</span>
                  </div>
                  <div class="mobile-data-card-item" style="grid-column: span 2">
                    <span class="label">Revenue</span>
                    <span class="val text-primary font-semibold">
                      {{ item.revenueGenerated | currency: 'INR': 'symbol': '1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="page-header no-print">
          <div>
            <h2>Enrollment Reports & Curriculum Analytics</h2>
            <p>Loading real-time institutional analytics...</p>
          </div>
        </div>
        <app-loading-skeleton type="card"></app-loading-skeleton>
        <div style="margin-top: 1.5rem">
          <app-loading-skeleton type="table"></app-loading-skeleton>
        </div>
      }
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
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
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

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .kpi-card {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .kpi-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 500;
      }
      .kpi-value {
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }
      .kpi-sub {
        font-size: 0.775rem;
        color: var(--text-muted);
      }

      .distributions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }
      @media (max-width: 860px) {
        .distributions-grid {
          grid-template-columns: 1fr;
        }
      }

      .status-bars {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .status-bar-row {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .bar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8125rem;
        color: var(--text-secondary);
      }

      .mono-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary);
      }

      .cell-primary-link {
        font-weight: 600;
        color: var(--text-primary);
      }
      .cell-primary-link:hover {
        color: var(--primary);
      }

      .occupancy-progress-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .occupancy-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .text-danger { color: var(--danger); }
      .text-success { color: var(--success); }
      .font-semibold { font-weight: 600; }

      .print-only-header {
        display: none;
      }

      @media (max-width: 640px) {
        .page-header {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }
        .header-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          width: 100%;
        }
        .header-actions .btn {
          width: 100%;
          justify-content: center;
          padding: 0.55rem 0.65rem;
          font-size: 0.8125rem;
        }
        .kpi-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .kpi-card {
          padding: 1rem 0.85rem;
        }
        .kpi-value {
          font-size: 1.35rem;
        }
        .distributions-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 480px) {
        .header-actions {
          grid-template-columns: 1fr;
        }
        .kpi-grid {
          grid-template-columns: 1fr;
        }
        .page-header h2 {
          font-size: 1.3rem;
        }
      }

      @media print {
        .no-print,
        .print-btn,
        .export-btn,
        .header-actions,
        app-sidebar,
        app-header {
          display: none !important;
        }

        .print-only-header {
          display: flex !important;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #111827;
          padding-bottom: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .print-header-brand h1 {
          font-size: 1.5rem;
          color: #1e1b4b;
          margin: 0;
          font-weight: 700;
        }
        .print-header-brand p {
          font-size: 0.85rem;
          color: #4b5563;
          margin: 0.2rem 0 0;
        }
        .print-header-meta {
          text-align: right;
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          color: #374151;
        }

        body {
          background: #ffffff !important;
          color: #111827 !important;
        }

        .page-container {
          padding: 0 !important;
          gap: 1.25rem !important;
        }

        .card {
          border: 1px solid #d1d5db !important;
          box-shadow: none !important;
          break-inside: avoid;
        }

        .data-table th,
        .data-table td {
          border: 1px solid #e5e7eb !important;
          padding: 0.5rem 0.6rem !important;
          font-size: 0.75rem !important;
        }

        .data-table th {
          background: #f3f4f6 !important;
          color: #111827 !important;
        }
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private notificationService = inject(NotificationService);

  generatedDate = new Date();
  reportData$!: Observable<AnalyticsReportData>;

  ngOnInit(): void {
    this.reportData$ = combineLatest([
      this.studentService.getStudents(),
      this.courseService.getCourses(),
      this.enrollmentService.getEnrollments(),
    ]).pipe(
      map(([students, courses, enrollments]) => {
        let totalRevenue = 0;
        let potentialRevenue = 0;

        const courseReports: CourseReportItem[] = courses.map((course) => {
          const courseEnrollments = enrollments.filter(
            (e) => e.courseId === course.id
          );
          const activeCount = courseEnrollments.filter(
            (e) => e.status === 'Active'
          ).length;
          const completedCount = courseEnrollments.filter(
            (e) => e.status === 'Completed'
          ).length;
          const cancelledCount = courseEnrollments.filter(
            (e) => e.status === 'Cancelled'
          ).length;

          const paidCount = courseEnrollments.filter(
            (e) => e.paymentStatus === 'Paid'
          ).length;
          const revenueGenerated = paidCount * course.fee;
          totalRevenue += revenueGenerated;
          potentialRevenue += course.capacity * course.fee;

          const occupancyPercent =
            course.capacity > 0
              ? Math.min(100, Math.round((activeCount / course.capacity) * 100))
              : 0;

          return {
            course,
            activeCount,
            completedCount,
            cancelledCount,
            totalEnrollments: courseEnrollments.length,
            revenueGenerated,
            occupancyPercent,
          };
        });

        const totalCapacity = courses.reduce((sum, c) => sum + c.capacity, 0);
        const totalActive = enrollments.filter((e) => e.status === 'Active').length;
        const overallOccupancy =
          totalCapacity > 0
            ? Math.round((totalActive / totalCapacity) * 100)
            : 0;

        const avgStudentsPerCourse =
          courses.length > 0 ? +(totalActive / courses.length).toFixed(1) : 0;

        const statusDistribution = {
          active: enrollments.filter((e) => e.status === 'Active').length,
          completed: enrollments.filter((e) => e.status === 'Completed').length,
          cancelled: enrollments.filter((e) => e.status === 'Cancelled').length,
        };

        const paymentDistribution = {
          paid: enrollments.filter((e) => e.paymentStatus === 'Paid').length,
          pending: enrollments.filter((e) => e.paymentStatus === 'Pending').length,
          waived: enrollments.filter((e) => e.paymentStatus === 'Waived').length,
        };

        return {
          totalRevenue,
          potentialRevenue,
          avgStudentsPerCourse,
          overallOccupancy,
          courseReports,
          statusDistribution,
          paymentDistribution,
        };
      })
    );
  }

  getTotalEnrollments(data: AnalyticsReportData): number {
    return (
      data.statusDistribution.active +
      data.statusDistribution.completed +
      data.statusDistribution.cancelled
    );
  }

  getPercent(count: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((count / total) * 100);
  }

  printReport(): void {
    window.print();
  }

  exportToCsv(data: AnalyticsReportData): void {
    if (!data) return;

    const rows: string[][] = [];

    // Formal institutional report header
    rows.push(['COURSE ENROLLMENT MANAGEMENT SYSTEM - OFFICIAL ACADEMIC REPORT']);
    rows.push([`Generated On: ${new Date().toLocaleString()}`]);
    rows.push(['Institution: EduEnroll Academic Portal']);
    rows.push([]);

    // 1. Institutional KPIs Summary
    rows.push(['=== INSTITUTIONAL KPI SUMMARY ===']);
    rows.push(['Metric Title', 'Reported Value', 'Institutional Context']);
    rows.push(['Total Realized Tuition Revenue', `Rs. ${data.totalRevenue.toLocaleString()}`, 'From confirmed paid registrations']);
    rows.push(['Potential Curriculum Revenue', `Rs. ${data.potentialRevenue.toLocaleString()}`, 'Yield at 100% capacity']);
    rows.push(['Overall Seat Occupancy Rate', `${data.overallOccupancy}%`, 'Active enrollments vs total seats']);
    rows.push(['Average Students Per Offering', `${data.avgStudentsPerCourse}`, 'Mean class size']);
    rows.push(['Active Registrations', `${data.statusDistribution.active}`, 'Currently attending']);
    rows.push(['Completed Registrations', `${data.statusDistribution.completed}`, 'Term completed']);
    rows.push(['Cancelled Registrations', `${data.statusDistribution.cancelled}`, 'Dropped or withdrawn']);
    rows.push(['Paid Registrations', `${data.paymentDistribution.paid}`, 'Full fee collected']);
    rows.push(['Pending Payments', `${data.paymentDistribution.pending}`, 'Awaiting settlement']);
    rows.push(['Waived / Scholarships', `${data.paymentDistribution.waived}`, 'Fee waived']);
    rows.push([]);

    // 2. Detailed Course-by-Course Curriculum Performance Breakdown
    rows.push(['=== COURSE-BY-COURSE CURRICULUM PERFORMANCE BREAKDOWN ===']);
    rows.push([
      'Course Code',
      'Course Title',
      'Academic Category',
      'Faculty / Instructor',
      'Total Capacity',
      'Available Seats',
      'Active Enrolled',
      'Completed',
      'Cancelled',
      'Total Registrations',
      'Occupancy (%)',
      'Tuition Fee (INR)',
      'Realized Revenue (INR)',
    ]);

    data.courseReports.forEach((item) => {
      rows.push([
        item.course.code,
        `"${item.course.name.replace(/"/g, '""')}"`,
        `"${item.course.category}"`,
        `"${item.course.instructor.replace(/"/g, '""')}"`,
        item.course.capacity.toString(),
        item.course.availableSeats.toString(),
        item.activeCount.toString(),
        item.completedCount.toString(),
        item.cancelledCount.toString(),
        item.totalEnrollments.toString(),
        `${item.occupancyPercent}%`,
        item.course.fee.toString(),
        item.revenueGenerated.toString(),
      ]);
    });

    rows.push([]);
    // Totals row
    const totalCap = data.courseReports.reduce((s, c) => s + c.course.capacity, 0);
    const totalAvail = data.courseReports.reduce((s, c) => s + c.course.availableSeats, 0);
    const totalActive = data.courseReports.reduce((s, c) => s + c.activeCount, 0);
    const totalComp = data.courseReports.reduce((s, c) => s + c.completedCount, 0);
    const totalCanc = data.courseReports.reduce((s, c) => s + c.cancelledCount, 0);
    const totalAllEnr = data.courseReports.reduce((s, c) => s + c.totalEnrollments, 0);

    rows.push([
      'SUMMARY TOTALS',
      `${data.courseReports.length} Courses Total`,
      '-',
      '-',
      totalCap.toString(),
      totalAvail.toString(),
      totalActive.toString(),
      totalComp.toString(),
      totalCanc.toString(),
      totalAllEnr.toString(),
      `${data.overallOccupancy}%`,
      '-',
      data.totalRevenue.toString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `EduEnroll_Academic_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.notificationService.success('All reports exported successfully to CSV spreadsheet!');
  }
}

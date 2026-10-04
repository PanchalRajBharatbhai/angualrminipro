import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { StudentService } from '../../core/services/student.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ConfirmModalComponent],
  template: `
    <div class="settings-container">
      <div class="page-header">
        <div>
          <h2>System Settings & Preferences</h2>
          <p>Manage administrative account details, display themes, and demonstration data fixtures.</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Administrator Profile Card -->
        <div class="card settings-card">
          <div class="card-header">
            <div class="header-title-wrap">
              <app-icon name="user" [size]="18" class="text-primary"></app-icon>
              <h3>Administrator Profile</h3>
            </div>
          </div>
          <div class="card-body">
            @if (authService.currentUser$ | async; as user) {
              <div class="profile-preview-row">
                <img
                  [src]="
                    user.avatar ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120'
                  "
                  alt="Avatar"
                  class="profile-avatar"
                />
                <div class="profile-meta">
                  <h4>{{ user.name }}</h4>
                  <span class="user-email">{{ user.email }}</span>
                  <span class="role-badge">{{ user.role }}</span>
                </div>
              </div>
            }

            <div class="setting-desc">
              Logged in as the primary academic registrar and course coordinator.
            </div>
          </div>
        </div>

        <!-- Display & Interface Preferences Card -->
        <div class="card settings-card">
          <div class="card-header">
            <div class="header-title-wrap">
              <app-icon name="settings" [size]="18" class="text-primary"></app-icon>
              <h3>Interface & Display Theme</h3>
            </div>
          </div>
          <div class="card-body">
            <div class="setting-row">
              <div class="setting-label-col">
                <span class="title">Color Scheme</span>
                <span class="desc">Toggle between crisp Light and pure Z-Black OLED Dark visual modes</span>
              </div>
              <div class="theme-switch-group">
                <button
                  type="button"
                  class="btn btn-sm"
                  [class.btn-primary]="!(themeService.isDark$ | async)"
                  [class.btn-outline]="themeService.isDark$ | async"
                  (click)="themeService.setDarkTheme(false)"
                >
                  <app-icon name="sun" [size]="15"></app-icon>
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  class="btn btn-sm"
                  [class.btn-primary]="themeService.isDark$ | async"
                  [class.btn-outline]="!(themeService.isDark$ | async)"
                  (click)="themeService.setDarkTheme(true)"
                >
                  <app-icon name="moon" [size]="15"></app-icon>
                  <span>Z-Black Dark</span>
                </button>
              </div>
            </div>

            <div class="setting-row mt-3">
              <div class="setting-label-col">
                <span class="title">Typography & Density</span>
                <span class="desc">Design token scale optimized for academic portals</span>
              </div>
              <span class="badge badge-active">Inter UI (Adaptive)</span>
            </div>
          </div>
        </div>

        <!-- College Viva Demo Data Fixture Management -->
        <div class="card settings-card" style="grid-column: span 2">
          <div class="card-header">
            <div class="header-title-wrap">
              <app-icon name="refresh" [size]="18" class="text-primary"></app-icon>
              <h3>Academic Viva Demonstration Data Fixture</h3>
            </div>
          </div>
          <div class="card-body">
            <div class="viva-banner">
              <app-icon name="info" [size]="20" class="text-primary"></app-icon>
              <div class="banner-text">
                <strong>Reset to Default College Demo Dataset</strong>
                <p>
                  During a viva or live examination, after creating, updating, or deleting records,
                  you can restore the initial catalog of 8 students, 6 courses, and 13 relational
                  enrollments with a single click.
                </p>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-sm text-danger"
                (click)="isResetModalOpen = true"
              >
                <app-icon name="refresh" [size]="14"></app-icon>
                <span>Reset Demo Database</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Academic Technology Specifications -->
        <div class="card settings-card" style="grid-column: span 2">
          <div class="card-header">
            <div class="header-title-wrap">
              <app-icon name="graduation-cap" [size]="18" class="text-primary"></app-icon>
              <h3>Mini Project System Architecture & Technology Stack</h3>
            </div>
          </div>
          <div class="card-body">
            <div class="tech-grid">
              <div class="tech-item">
                <span class="tech-label">Framework</span>
                <span class="tech-value">Angular 21 (Standalone Components)</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Language</span>
                <span class="tech-value">TypeScript 5.9</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Reactivity & State</span>
                <span class="tech-value">RxJS Observables & BehaviorSubjects</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Forms Validation</span>
                <span class="tech-value">Angular Reactive Forms with Custom Validators</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Routing & Guards</span>
                <span class="tech-value">Angular Router with Functional AuthGuard</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Persistence Layer</span>
                <span class="tech-value">LocalStorage API + In-Memory Service Gateway</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Icon System</span>
                <span class="tech-value">Lucide Pure Vector SVG (Zero Emojis)</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Responsiveness</span>
                <span class="tech-value">Mobile Drawer, Fluid Grid (320px to 4K)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isResetModalOpen"
        title="Reset Demo Dataset?"
        message="Are you sure you want to reset all students, courses, and enrollment records back to original seed defaults?"
        details="All custom changes created during this session will be overwritten with clean university demo fixtures."
        confirmText="Reset Database"
        variant="warning"
        (confirm)="confirmReset()"
        (cancel)="isResetModalOpen = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [
    `
      .settings-container {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
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

      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.75rem;
      }
      @media (max-width: 900px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }
        .settings-card {
          grid-column: span 1 !important;
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

      .profile-preview-row {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-bottom: 1rem;
      }

      .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-full);
        object-fit: cover;
        border: 2px solid var(--border);
      }

      .profile-meta h4 {
        font-size: 1.05rem;
        font-weight: 600;
      }

      .user-email {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        display: block;
      }

      .role-badge {
        display: inline-block;
        font-size: 0.72rem;
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-full);
        background: var(--primary-light);
        color: var(--primary);
        font-weight: 600;
        margin-top: 0.35rem;
      }

      .setting-desc {
        font-size: 0.8125rem;
        color: var(--text-muted);
        line-height: 1.4;
      }

      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .setting-label-col {
        display: flex;
        flex-direction: column;
      }
      .setting-label-col .title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .setting-label-col .desc {
        font-size: 0.775rem;
        color: var(--text-muted);
      }

      .theme-switch-group {
        display: flex;
        gap: 0.35rem;
      }

      .viva-banner {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
        padding: 1rem 1.25rem;
        background: var(--surface-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
      }

      .banner-text {
        flex: 1;
        min-width: 240px;
      }
      .banner-text strong {
        font-size: 0.9rem;
        color: var(--text-primary);
      }
      .banner-text p {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin-top: 0.2rem;
      }

      .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .tech-item {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        background: var(--surface-secondary);
      }
      .tech-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .tech-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .text-danger { color: var(--danger); }
      .text-danger:hover { background: var(--danger-light); }
      .mt-3 { margin-top: 1rem; }
    `,
  ],
})
export class SettingsComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private storageService = inject(StorageService);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private notificationService = inject(NotificationService);

  isResetModalOpen = false;

  confirmReset(): void {
    this.storageService.resetToSeedData();
    this.studentService.refresh();
    this.courseService.refresh();
    this.enrollmentService.refresh();
    this.isResetModalOpen = false;
    this.notificationService.success(
      'Demo Dataset Restored',
      'The initial college seed records have been successfully restored.'
    );
  }
}

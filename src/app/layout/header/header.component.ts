import { Component, EventEmitter, Output, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
  icon: string;
  link?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="app-header">
      <div class="header-left">
        <!-- Mobile Hamburger -->
        <button
          type="button"
          class="btn-icon mobile-menu-btn"
          (click)="toggleMobileMenu.emit()"
          aria-label="Toggle navigation menu"
        >
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <!-- Dynamic Title & Breadcrumbs -->
        <div class="page-meta">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <nav class="breadcrumb-trail" aria-label="Breadcrumb">
            <span class="crumb root">Admin</span>
            <span class="crumb-separator">/</span>
            <span class="crumb active">{{ pageTitle }}</span>
          </nav>
        </div>
      </div>

      <div class="header-right">
        <!-- Theme Toggle -->
        <button
          type="button"
          class="btn-icon theme-toggle"
          (click)="themeService.toggleTheme()"
          [title]="(themeService.isDark$ | async) ? 'Switch to Light Mode' : 'Switch to Z-Black Dark Mode'"
          aria-label="Toggle color theme"
        >
          @if (themeService.isDark$ | async) {
            <app-icon name="sun" [size]="18"></app-icon>
          } @else {
            <app-icon name="moon" [size]="18"></app-icon>
          }
        </button>

        <!-- Notification Bell & Dropdown Container -->
        <div class="notif-wrapper">
          <button
            type="button"
            class="btn-icon notif-btn"
            title="System notifications"
            aria-label="Notifications"
            (click)="toggleNotifications($event)"
            [class.active]="isNotifOpen"
          >
            <app-icon name="bell" [size]="18"></app-icon>
            @if (unreadCount > 0) {
              <span class="notif-count-badge">{{ unreadCount }}</span>
            }
          </button>

          <!-- Notifications Popup Panel -->
          @if (isNotifOpen) {
            <div class="notif-dropdown" (click)="$event.stopPropagation()">
              <div class="notif-header">
                <div class="notif-header-title">
                  <h4>Notifications</h4>
                  @if (unreadCount > 0) {
                    <span class="unread-pill">{{ unreadCount }} new</span>
                  }
                </div>
                @if (notifications.length > 0) {
                  <button
                    type="button"
                    class="btn-text-action"
                    (click)="markAllAsRead()"
                  >
                    Mark all as read
                  </button>
                }
              </div>

              <div class="notif-list">
                @if (notifications.length === 0) {
                  <div class="notif-empty">
                    <app-icon name="check-circle" [size]="28" class="text-muted"></app-icon>
                    <p>You're all caught up!</p>
                    <span>No unread notifications at this time.</span>
                  </div>
                } @else {
                  @for (n of notifications; track n.id) {
                    <div
                      class="notif-item"
                      [class.unread]="!n.read"
                      (click)="onNotificationClick(n)"
                    >
                      <div class="notif-icon-wrap" [ngClass]="n.type">
                        <app-icon [name]="n.icon" [size]="14"></app-icon>
                      </div>
                      <div class="notif-content">
                        <div class="notif-title-row">
                          <span class="notif-title">{{ n.title }}</span>
                          <span class="notif-time">{{ n.time }}</span>
                        </div>
                        <p class="notif-msg">{{ n.message }}</p>
                      </div>
                      @if (!n.read) {
                        <span class="unread-dot"></span>
                      }
                    </div>
                  }
                }
              </div>

              @if (notifications.length > 0) {
                <div class="notif-footer">
                  <button type="button" class="btn-clear-all" (click)="clearAll()">
                    Clear All Notifications
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- User Chip -->
        @if (authService.currentUser$ | async; as user) {
          <div class="user-chip" [routerLink]="['/settings']" title="Open Settings">
            <img
              [src]="user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'"
              alt="Avatar"
              class="header-avatar"
            />
            <div class="user-chip-text">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
          </div>
        }
      </div>
    </header>
  `,
  styles: [
    `
      .app-header {
        height: var(--header-height);
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 0 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 90;
        transition: background var(--transition-base);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .mobile-menu-btn {
        display: none;
      }

      @media (max-width: 992px) {
        .mobile-menu-btn {
          display: inline-flex;
        }
      }

      .page-meta {
        display: flex;
        flex-direction: column;
      }

      .page-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.015em;
        line-height: 1.2;
      }

      .breadcrumb-trail {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 1px;
      }
      .crumb.active {
        color: var(--text-secondary);
        font-weight: 500;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      /* Notification System */
      .notif-wrapper {
        position: relative;
      }

      .notif-btn {
        position: relative;
      }
      .notif-btn.active {
        background: var(--surface-secondary);
        color: var(--primary);
      }

      .notif-count-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: var(--radius-full);
        background: var(--danger);
        color: #ffffff;
        font-size: 0.65rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--surface);
        line-height: 1;
      }

      .notif-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 340px;
        max-width: calc(100vw - 24px);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 1000;
        overflow: hidden;
        animation: fadeIn 0.15s ease-out;
      }

      .notif-header {
        padding: 0.875rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }

      .notif-header-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .notif-header-title h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .unread-pill {
        padding: 0.125rem 0.4rem;
        border-radius: var(--radius-full);
        background: var(--primary-light);
        color: var(--primary);
        font-size: 0.6875rem;
        font-weight: 600;
      }

      .btn-text-action {
        background: none;
        border: none;
        color: var(--primary);
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
      }
      .btn-text-action:hover {
        text-decoration: underline;
      }

      .notif-list {
        max-height: 360px;
        overflow-y: auto;
      }

      .notif-empty {
        padding: 2.5rem 1.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }
      .notif-empty p {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
        margin: 0;
      }
      .notif-empty span {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .notif-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-subtle);
        cursor: pointer;
        position: relative;
        transition: background var(--transition-fast);
      }
      .notif-item:hover {
        background: var(--surface-hover);
      }
      .notif-item.unread {
        background: var(--surface-secondary);
      }

      .notif-icon-wrap {
        width: 28px;
        height: 28px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .notif-icon-wrap.info {
        background: var(--primary-light);
        color: var(--primary);
      }
      .notif-icon-wrap.success {
        background: var(--success-light);
        color: var(--success);
      }
      .notif-icon-wrap.warning {
        background: var(--warning-light);
        color: var(--warning);
      }

      .notif-content {
        flex: 1;
        min-width: 0;
      }

      .notif-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.2rem;
      }

      .notif-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .notif-time {
        font-size: 0.6875rem;
        color: var(--text-muted);
        white-space: nowrap;
      }

      .notif-msg {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.35;
      }

      .unread-dot {
        width: 7px;
        height: 7px;
        border-radius: var(--radius-full);
        background: var(--primary);
        flex-shrink: 0;
        margin-top: 6px;
      }

      .notif-footer {
        padding: 0.625rem 1rem;
        border-top: 1px solid var(--border);
        text-align: center;
        background: var(--surface);
      }

      .btn-clear-all {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 0.75rem;
        cursor: pointer;
      }
      .btn-clear-all:hover {
        color: var(--text-primary);
      }

      .user-chip {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.35rem 0.65rem;
        border-radius: var(--radius-full);
        background: var(--surface-secondary);
        border: 1px solid var(--border);
        cursor: pointer;
        transition: all var(--transition-fast);
        text-decoration: none;
      }
      .user-chip:hover {
        background: var(--surface-tertiary);
        border-color: var(--border-focus);
      }

      .header-avatar {
        width: 28px;
        height: 28px;
        border-radius: var(--radius-full);
        object-fit: cover;
      }

      .user-chip-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }

      .user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .user-role {
        font-size: 0.675rem;
        color: var(--text-muted);
      }

      @media (max-width: 640px) {
        .app-header {
          padding: 0 0.5rem;
        }
        .header-left {
          gap: 0.35rem;
          min-width: 0;
          overflow: hidden;
        }
        .header-right {
          gap: 0.25rem;
          flex-shrink: 0;
        }
        .user-chip {
          padding: 0.25rem;
        }
        .user-chip-text {
          display: none;
        }
        .breadcrumb-trail {
          display: none;
        }
        .page-title {
          font-size: 0.925rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 130px;
        }
        .notif-dropdown {
          width: 290px;
          right: -50px;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  @Output() toggleMobileMenu = new EventEmitter<void>();

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  pageTitle = 'Dashboard';
  isNotifOpen = false;

  notifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'New Student Enrollment',
      message: 'Aarav Sharma enrolled in Advanced Full Stack Web Engineering.',
      time: '10m ago',
      read: false,
      type: 'info',
      icon: 'clipboard-list',
      link: '/enrollments',
    },
    {
      id: 'notif-2',
      title: 'Capacity Alert (92%)',
      message: 'Cloud Infrastructure & DevOps has only 3 available seats left.',
      time: '35m ago',
      read: false,
      type: 'warning',
      icon: 'alert-triangle',
      link: '/courses',
    },
    {
      id: 'notif-3',
      title: 'Tuition Payment Confirmed',
      message: 'Meera Nambiar completed INR 14,000 tuition fee payment.',
      time: '2h ago',
      read: false,
      type: 'success',
      icon: 'check-circle',
      link: '/enrollments',
    },
    {
      id: 'notif-4',
      title: 'Database Synchronized',
      message: 'All local course rosters successfully reconciled.',
      time: '5h ago',
      read: true,
      type: 'info',
      icon: 'info',
    },
  ];

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  constructor() {
    this.updateTitle(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateTitle(event.urlAfterRedirects || event.url);
      });
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotifOpen = !this.isNotifOpen;
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
  }

  clearAll(): void {
    this.notifications = [];
    this.isNotifOpen = false;
  }

  onNotificationClick(n: AppNotification): void {
    n.read = true;
    if (n.link) {
      this.isNotifOpen = false;
      this.router.navigateByUrl(n.link);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isNotifOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isNotifOpen = false;
    }
  }

  private updateTitle(url: string): void {
    const clean = url.split('?')[0];
    if (clean.includes('/students/add')) this.pageTitle = 'Add Student';
    else if (clean.includes('/students/edit')) this.pageTitle = 'Edit Student';
    else if (clean.includes('/students/')) this.pageTitle = 'Student Profile';
    else if (clean.includes('/students')) this.pageTitle = 'Student Management';
    else if (clean.includes('/courses/add')) this.pageTitle = 'Add Course';
    else if (clean.includes('/courses/edit')) this.pageTitle = 'Edit Course';
    else if (clean.includes('/courses/')) this.pageTitle = 'Course Details';
    else if (clean.includes('/courses')) this.pageTitle = 'Course Management';
    else if (clean.includes('/enrollments/add')) this.pageTitle = 'New Enrollment';
    else if (clean.includes('/enrollments/edit')) this.pageTitle = 'Edit Enrollment';
    else if (clean.includes('/enrollments/')) this.pageTitle = 'Enrollment Details';
    else if (clean.includes('/enrollments')) this.pageTitle = 'Enrollment Management';
    else if (clean.includes('/reports')) this.pageTitle = 'Reports & Analytics';
    else if (clean.includes('/settings')) this.pageTitle = 'System Settings';
    else this.pageTitle = 'Dashboard Overview';
  }
}

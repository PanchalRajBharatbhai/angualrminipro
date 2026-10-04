import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <!-- Brand Header -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <app-icon name="graduation-cap" [size]="24" color="#ffffff"></app-icon>
        </div>
        <div class="brand-meta" [class.hidden]="isCollapsed">
          <span class="brand-name">EduEnroll</span>
          <span class="brand-sub">Management System</span>
        </div>
        <button
          type="button"
          class="btn-collapse"
          (click)="toggleCollapse.emit()"
          [title]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <app-icon
            [name]="isCollapsed ? 'chevron-right' : 'chevron-left'"
            [size]="16"
          ></app-icon>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" [class.hidden]="isCollapsed">Main Menu</div>
        <ul>
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                (click)="navClick.emit()"
                class="nav-link"
                [title]="item.label"
              >
                <app-icon [name]="item.icon" [size]="20" class="nav-icon"></app-icon>
                <span class="nav-label" [class.hidden]="isCollapsed">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Sidebar Footer / Profile -->
      <div class="sidebar-footer">
        @if (authService.currentUser$ | async; as user) {
          <div class="user-profile-widget" [class.collapsed]="isCollapsed">
            <img
              [src]="user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'"
              alt="Avatar"
              class="user-avatar"
            />
            <div class="user-details" [class.hidden]="isCollapsed">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
            <button
              type="button"
              class="btn-logout"
              (click)="onLogout()"
              title="Logout"
              [class.hidden]="isCollapsed"
            >
              <app-icon name="log-out" [size]="18"></app-icon>
            </button>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: var(--sidebar-width);
        height: 100vh;
        background: var(--surface);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        transition: width var(--transition-base);
        position: relative;
        z-index: 100;
        user-select: none;
      }

      .sidebar.collapsed {
        width: var(--sidebar-collapsed-width);
      }

      .sidebar-brand {
        height: var(--header-height);
        padding: 0 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border-bottom: 1px solid var(--border);
        position: relative;
      }

      .brand-logo {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        background: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
      }

      .brand-meta {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        white-space: nowrap;
      }

      .brand-name {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        line-height: 1.1;
      }

      .brand-sub {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 1px;
      }

      .btn-collapse {
        position: absolute;
        right: -12px;
        top: 20px;
        width: 24px;
        height: 24px;
        border-radius: var(--radius-full);
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
        z-index: 2;
      }
      .btn-collapse:hover {
        background: var(--surface-secondary);
        color: var(--text-primary);
      }

      @media (max-width: 992px) {
        .btn-collapse {
          display: none;
        }
      }

      .sidebar-nav {
        flex: 1;
        padding: 1.25rem 0.75rem;
        overflow-y: auto;
      }

      .nav-section-title {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        padding: 0 0.75rem 0.5rem;
      }

      .sidebar-nav ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.65rem 0.85rem;
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        transition: all var(--transition-fast);
        white-space: nowrap;
        text-decoration: none;
      }

      .nav-link:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      .nav-link.active {
        background: var(--primary-light);
        color: var(--primary);
        font-weight: 600;
      }
      .nav-link.active .nav-icon {
        color: var(--primary);
      }

      .nav-icon {
        flex-shrink: 0;
      }

      .sidebar-footer {
        padding: 1rem 0.75rem;
        border-top: 1px solid var(--border);
        background: var(--surface);
      }

      .user-profile-widget {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: var(--radius-md);
        background: var(--surface-secondary);
      }
      .user-profile-widget.collapsed {
        justify-content: center;
        padding: 0.5rem 0;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        object-fit: cover;
        flex-shrink: 0;
        border: 2px solid var(--surface);
      }

      .user-details {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .btn-logout {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.35rem;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
      }
      .btn-logout:hover {
        color: var(--danger);
        background: var(--danger-light);
      }

      .hidden {
        display: none !important;
      }
    `,
  ],
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() navClick = new EventEmitter<void>();

  public authService = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
    { label: 'Students', route: '/students', icon: 'users' },
    { label: 'Courses', route: '/courses', icon: 'book-open' },
    { label: 'Enrollments', route: '/enrollments', icon: 'clipboard-list' },
    { label: 'Reports', route: '/reports', icon: 'bar-chart-3' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];

  onLogout(): void {
    this.authService.logout();
  }
}

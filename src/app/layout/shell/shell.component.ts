import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ToastContainerComponent,
  ],
  template: `
    <div class="app-layout" [class.mobile-open]="isMobileMenuOpen">
      <!-- Sidebar / Drawer -->
      <app-sidebar
        class="layout-sidebar"
        [isCollapsed]="isSidebarCollapsed"
        (toggleCollapse)="toggleSidebar()"
        (navClick)="closeMobileMenu()"
      ></app-sidebar>

      <!-- Mobile Backdrop -->
      @if (isMobileMenuOpen) {
        <div class="mobile-backdrop" (click)="closeMobileMenu()"></div>
      }

      <!-- Main Shell Area -->
      <div class="layout-main">
        <app-header (toggleMobileMenu)="toggleMobileMenu()"></app-header>
        <main class="layout-content">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- Global Page Footer -->
        <footer class="app-footer">
          <div class="footer-container">
            <div class="footer-brand-info">
              <span class="footer-brand-title">EduEnroll</span>
              <span class="footer-separator">&bull;</span>
              <span class="footer-tagline">Academic Course Enrollment Management System</span>
            </div>
            <div class="footer-status-info">
              <span class="footer-badge">
                <span class="status-dot"></span> System Live & Operational
              </span>
              <span class="footer-copyright">&copy; 2026 EduEnroll Academic Portal</span>
            </div>
          </div>
        </footer>
      </div>

      <!-- Global Toast Container -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        width: 100%;
        max-width: 100%;
        min-height: 100vh;
        min-height: 100dvh;
        overflow-x: hidden;
        background-color: var(--bg-page);
        box-sizing: border-box;
      }

      .layout-sidebar {
        flex-shrink: 0;
      }

      .layout-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        width: 100%;
        max-width: 100%;
        height: 100vh;
        height: 100dvh;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }

      .layout-content {
        flex: 1 0 auto;
        padding: 1.75rem 2.25rem 2.5rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .content-container {
        max-width: 1360px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      /* Global App Footer */
      .app-footer {
        margin-top: auto;
        border-top: 1px solid var(--border);
        background: var(--surface);
        padding: 1.25rem 2.25rem;
        box-sizing: border-box;
        flex-shrink: 0;
      }

      .footer-container {
        max-width: 1360px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.8125rem;
        color: var(--text-muted);
      }

      .footer-brand-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .footer-brand-title {
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .footer-separator {
        color: var(--border);
      }

      .footer-tagline {
        color: var(--text-secondary);
        font-size: 0.8rem;
      }

      .footer-status-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .footer-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.75rem;
        font-weight: 500;
        padding: 0.2rem 0.65rem;
        border-radius: var(--radius-full);
        background: var(--success-light);
        color: var(--success-text);
        border: 1px solid var(--success-border);
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 6px var(--success);
        animation: pulse 2.5s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(1.2);
        }
      }

      .footer-copyright {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      /* Mobile Drawer Behavior */
      @media (max-width: 992px) {
        .layout-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          height: 100%;
          height: 100dvh;
          width: 280px;
          max-width: 85vw;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform var(--transition-base);
          box-shadow: none;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .app-layout.mobile-open .layout-sidebar {
          transform: translateX(0);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.4);
        }

        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(3px);
          z-index: 999;
          animation: fadeIn 150ms ease forwards;
        }

        .layout-content {
          padding: 1.25rem 1.25rem 2rem;
        }

        .app-footer {
          padding: 1rem 1.25rem;
          padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
        }
      }

      @media (max-width: 480px) {
        .layout-content {
          padding: 1rem 0.875rem 2rem;
        }

        .app-footer {
          padding: 1rem 0.875rem;
          padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
        }

        .footer-container {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.65rem;
        }

        .footer-status-info {
          width: 100%;
          justify-content: space-between;
        }
      }
    `,
  ],
})
export class ShellComponent {
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 992 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}

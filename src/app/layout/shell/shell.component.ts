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
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
      }

      .layout-content {
        flex: 1;
        padding: 1.75rem 2.25rem;
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

      /* Mobile Drawer Behavior */
      @media (max-width: 992px) {
        .layout-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform var(--transition-base);
          box-shadow: none;
        }

        .app-layout.mobile-open .layout-sidebar {
          transform: translateX(0);
          box-shadow: var(--shadow-xl);
        }

        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(2px);
          z-index: 999;
          animation: fadeIn 150ms ease forwards;
        }

        .layout-content {
          padding: 1.25rem 1.25rem;
        }
      }

      @media (max-width: 480px) {
        .layout-content {
          padding: 1rem 0.875rem;
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

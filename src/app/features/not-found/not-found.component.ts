import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="not-found-wrapper">
      <div class="card not-found-card">
        <div class="icon-wrap">
          <app-icon name="alert-circle" [size]="44"></app-icon>
        </div>
        <span class="error-code">404</span>
        <h2>Page Not Found</h2>
        <p>The academic resource, management screen, or directory path you requested does not exist or has been relocated.</p>
        <a routerLink="/dashboard" class="btn btn-primary">
          <app-icon name="layout-dashboard" [size]="16"></app-icon>
          <span>Return to Dashboard</span>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-wrapper {
        min-height: 70vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
      }

      .not-found-card {
        max-width: 480px;
        width: 100%;
        padding: 3rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .icon-wrap {
        width: 72px;
        height: 72px;
        border-radius: var(--radius-full);
        background: var(--surface-secondary);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .error-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 2.75rem;
        font-weight: 800;
        color: var(--primary);
        line-height: 1;
      }

      .not-found-card h2 {
        font-size: 1.35rem;
        font-weight: 700;
      }

      .not-found-card p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class NotFoundComponent {}

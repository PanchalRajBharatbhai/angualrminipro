import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'table') {
      <div class="skeleton-table">
        <div class="skeleton-row header skeleton-shimmer"></div>
        @for (row of [1, 2, 3, 4, 5]; track row) {
          <div class="skeleton-row skeleton-shimmer"></div>
        }
      </div>
    } @else if (type === 'card') {
      <div class="skeleton-grid">
        @for (item of [1, 2, 3, 4]; track item) {
          <div class="skeleton-card skeleton-shimmer"></div>
        }
      </div>
    } @else {
      <div class="skeleton-detail">
        <div class="skeleton-block lg skeleton-shimmer"></div>
        <div class="skeleton-block md skeleton-shimmer"></div>
        <div class="skeleton-block sm skeleton-shimmer"></div>
      </div>
    }
  `,
  styles: [
    `
      .skeleton-shimmer {
        background: linear-gradient(
          90deg,
          var(--surface-secondary) 25%,
          var(--surface-tertiary) 50%,
          var(--surface-secondary) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: var(--radius-sm);
      }

      .skeleton-table {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
      }

      .skeleton-row {
        height: 44px;
        width: 100%;
      }
      .skeleton-row.header {
        height: 36px;
        opacity: 0.7;
      }

      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      .skeleton-card {
        height: 120px;
        border-radius: var(--radius-lg);
      }

      .skeleton-detail {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
      }
      .skeleton-block {
        width: 100%;
        border-radius: var(--radius-md);
      }
      .skeleton-block.lg { height: 160px; }
      .skeleton-block.md { height: 100px; }
      .skeleton-block.sm { height: 60px; }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  @Input() type: 'table' | 'card' | 'detail' = 'table';
}

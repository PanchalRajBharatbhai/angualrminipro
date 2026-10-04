import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="empty-state-box">
      <div class="empty-icon-wrap">
        <app-icon [name]="icon" [size]="32"></app-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      @if (actionText) {
        <button
          type="button"
          class="btn btn-primary btn-sm"
          (click)="action.emit()"
        >
          <app-icon [name]="actionIcon" [size]="16"></app-icon>
          <span>{{ actionText }}</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .empty-state-box {
        padding: 3rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: var(--surface);
        border: 1px dashed var(--border);
        border-radius: var(--radius-lg);
        margin: 1rem 0;
      }

      .empty-icon-wrap {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-full);
        background: var(--surface-secondary);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .empty-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.35rem;
      }

      .empty-message {
        font-size: 0.875rem;
        color: var(--text-secondary);
        max-width: 360px;
        line-height: 1.45;
        margin-bottom: 1.25rem;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'search';
  @Input() title = 'No results found';
  @Input() message = 'Try adjusting your search terms or filters to find what you are looking for.';
  @Input() actionText?: string;
  @Input() actionIcon = 'plus';

  @Output() action = new EventEmitter<void>();
}

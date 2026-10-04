import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  ToastMessage,
} from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of notificationService.toasts$ | async; track toast.id) {
        <div class="toast-item" [ngClass]="toast.type">
          <div class="toast-icon">
            <app-icon [name]="getIcon(toast.type)" [size]="18"></app-icon>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-message">{{ toast.message }}</div>
            }
          </div>
          <button
            type="button"
            class="toast-close"
            (click)="notificationService.remove(toast.id)"
            aria-label="Dismiss notification"
          >
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        width: 380px;
        max-width: calc(100vw - 2.5rem);
        pointer-events: none;
        box-sizing: border-box;
      }

      .toast-item {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: var(--radius-md);
        background: var(--surface-card);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-lg), 0 4px 12px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(8px);
        box-sizing: border-box;
        width: 100%;
        animation: slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .toast-icon {
        flex-shrink: 0;
        margin-top: 1px;
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.3;
      }

      .toast-message {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin-top: 0.2rem;
        line-height: 1.4;
        word-break: break-word;
      }

      .toast-close {
        flex-shrink: 0;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-xs);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        min-height: 24px;
        margin-left: 0.25rem;
      }
      .toast-close:hover {
        color: var(--text-primary);
        background: var(--surface-secondary);
      }

      /* Type variants */
      .toast-item.success {
        border-left: 4px solid var(--success);
      }
      .toast-item.success .toast-icon {
        color: var(--success);
      }

      .toast-item.error {
        border-left: 4px solid var(--danger);
      }
      .toast-item.error .toast-icon {
        color: var(--danger);
      }

      .toast-item.warning {
        border-left: 4px solid var(--warning);
      }
      .toast-item.warning .toast-icon {
        color: var(--warning);
      }

      .toast-item.info {
        border-left: 4px solid var(--info);
      }
      .toast-item.info .toast-icon {
        color: var(--info);
      }

      @media (max-width: 480px) {
        .toast-stack {
          top: 0.625rem;
          right: 0.625rem;
          left: 0.625rem;
          width: auto !important;
          max-width: calc(100vw - 1.25rem);
        }
        .toast-item {
          padding: 0.75rem 0.875rem;
          gap: 0.625rem;
          animation: slideInDown 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      }

      @media (max-width: 340px) {
        .toast-stack {
          top: 0.5rem;
          right: 0.5rem;
          left: 0.5rem;
          max-width: calc(100vw - 1rem);
        }
        .toast-item {
          padding: 0.625rem 0.625rem;
          gap: 0.5rem;
        }
        .toast-title {
          font-size: 0.8125rem;
        }
        .toast-message {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  public notificationService = inject(NotificationService);

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info';
    }
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-dialog" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="icon-bubble" [ngClass]="variant">
              <app-icon [name]="iconName" [size]="20"></app-icon>
            </div>
            <div class="header-text">
              <h3>{{ title }}</h3>
              <p>{{ message }}</p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Close dialog"
              (click)="cancel.emit()"
            >
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          @if (details) {
            <div class="modal-details">
              {{ details }}
            </div>
          }

          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-outline"
              [disabled]="loading"
              (click)="cancel.emit()"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              [ngClass]="confirmBtnClass"
              [disabled]="loading"
              (click)="confirm.emit()"
            >
              @if (loading) {
                <span class="btn-spinner"></span>
                <span>Processing...</span>
              } @else {
                <span>{{ confirmText }}</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1050;
        background-color: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: fadeIn 150ms ease forwards;
      }

      .modal-dialog {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        width: 100%;
        max-width: 460px;
        overflow: hidden;
        animation: scaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .modal-header {
        padding: 1.5rem;
        display: flex;
        gap: 1rem;
        position: relative;
      }

      .icon-bubble {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .icon-bubble.danger {
        background: var(--danger-light);
        color: var(--danger);
        border: 1px solid var(--danger-border);
      }
      .icon-bubble.warning {
        background: var(--warning-light);
        color: var(--warning);
        border: 1px solid var(--warning-border);
      }
      .icon-bubble.info {
        background: var(--info-light);
        color: var(--info);
        border: 1px solid var(--info-border);
      }

      .header-text {
        flex: 1;
      }
      .header-text h3 {
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 0.35rem;
        color: var(--text-primary);
      }
      .header-text p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .btn-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-close:hover {
        color: var(--text-primary);
        background: var(--surface-secondary);
      }

      .modal-details {
        padding: 0.75rem 1.5rem;
        background: var(--surface-secondary);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        font-size: 0.8125rem;
        color: var(--text-secondary);
        font-family: monospace;
      }

      .modal-actions {
        padding: 1rem 1.5rem;
        background: var(--surface-secondary);
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .btn-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() details?: string;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get iconName(): string {
    return this.variant === 'danger'
      ? 'alert-circle'
      : this.variant === 'warning'
      ? 'alert-triangle'
      : 'info';
  }

  get confirmBtnClass(): string {
    return this.variant === 'danger' ? 'btn-danger' : 'btn-primary';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }
}

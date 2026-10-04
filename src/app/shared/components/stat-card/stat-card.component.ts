import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stat-card" [ngClass]="variant">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-wrap" [ngClass]="variant">
          <app-icon [name]="icon" [size]="20"></app-icon>
        </div>
      </div>

      <div class="stat-main">
        <div class="stat-value">{{ value }}</div>
        @if (subtext) {
          <div class="stat-footer">
            @if (trend === 'up') {
              <span class="trend-badge positive">
                <app-icon name="trending-up" [size]="12"></app-icon>
                <span>{{ change }}</span>
              </span>
            } @else if (trend === 'down') {
              <span class="trend-badge negative">
                <span>{{ change }}</span>
              </span>
            }
            <span class="stat-subtext">{{ subtext }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .stat-card {
        background: var(--surface-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 1.25rem 1.35rem;
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        box-sizing: border-box;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .stat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .stat-title {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .stat-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-secondary);
        color: var(--text-secondary);
      }
      .stat-icon-wrap.primary {
        background: var(--primary-light);
        color: var(--primary);
      }
      .stat-icon-wrap.success {
        background: var(--success-light);
        color: var(--success);
      }
      .stat-icon-wrap.info {
        background: var(--info-light);
        color: var(--info);
      }
      .stat-icon-wrap.warning {
        background: var(--warning-light);
        color: var(--warning);
      }

      .stat-main {
        margin-top: 0.75rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .stat-value {
        font-size: 1.85rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      .stat-footer {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        margin-top: 0.5rem;
        flex-wrap: nowrap;
        min-height: 22px;
      }

      .trend-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.125rem 0.4rem;
        border-radius: var(--radius-full);
        flex-shrink: 0;
      }
      .trend-badge.positive {
        background: var(--success-light);
        color: var(--success-text);
      }
      .trend-badge.negative {
        background: var(--danger-light);
        color: var(--danger-text);
      }

      .stat-subtext {
        font-size: 0.775rem;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) value: number | string = 0;
  @Input() icon = 'bar-chart';
  @Input() change?: string;
  @Input() subtext?: string;
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' | 'default' = 'default';
}

import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass()">
      <span class="badge-dot"></span>
      <span>{{ label || status }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';
  @Input() label?: string;

  badgeClass = computed(() => {
    const s = this.status?.toLowerCase() || '';
    switch (s) {
      case 'active':
      case 'paid':
        return 'badge-active';
      case 'inactive':
      case 'waived':
        return 'badge-inactive';
      case 'upcoming':
      case 'pending':
        return 'badge-upcoming';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
      case 'suspended':
        return 'badge-cancelled';
      default:
        return 'badge-inactive';
    }
  });
}

import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (totalItems > 0) {
      <div class="pagination-container">
        <div class="pagination-info">
          Showing <span>{{ startItem() }}</span> to <span>{{ endItem() }}</span> of <span>{{ totalItems }}</span> entries
        </div>

        @if (totalPages() > 1) {
          <div class="pagination-controls">
            <button
              type="button"
              class="page-btn"
              [disabled]="currentPage === 1"
              (click)="onPage(currentPage - 1)"
              aria-label="Previous page"
            >
              <app-icon name="chevron-left" [size]="16"></app-icon>
            </button>

            @for (p of pages(); track p) {
              <button
                type="button"
                class="page-btn"
                [class.active]="p === currentPage"
                (click)="onPage(p)"
              >
                {{ p }}
              </button>
            }

            <button
              type="button"
              class="page-btn"
              [disabled]="currentPage === totalPages()"
              (click)="onPage(currentPage + 1)"
              aria-label="Next page"
            >
              <app-icon name="chevron-right" [size]="16"></app-icon>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .pagination-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1.25rem;
        background: var(--surface);
        border-top: 1px solid var(--border);
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .pagination-info {
        font-size: 0.8125rem;
        color: var(--text-secondary);
      }
      .pagination-info span {
        font-weight: 600;
        color: var(--text-primary);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .page-btn {
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text-secondary);
        font-size: 0.8125rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .page-btn:hover:not(:disabled) {
        background: var(--surface-secondary);
        color: var(--text-primary);
        border-color: var(--border);
      }

      .page-btn.active {
        background: var(--primary);
        color: #ffffff;
        border-color: var(--primary);
      }

      .page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      @media (max-width: 640px) {
        .pagination-container {
          flex-direction: column;
          align-items: center;
        }
      }
    `,
  ],
})
export class PaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) pageSize = 10;
  @Input({ required: true }) totalItems = 0;

  @Output() pageChange = new EventEmitter<number>();

  totalPages = computed(() => Math.ceil(this.totalItems / this.pageSize) || 1);

  startItem = computed(() => {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  });

  endItem = computed(() => {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  });

  pages = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, cur - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  onPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}

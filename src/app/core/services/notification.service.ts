import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  public show(
    type: ToastType,
    title: string,
    message?: string,
    duration = 4000
  ): string {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  public success(title: string, message?: string, duration?: number): string {
    return this.show('success', title, message, duration);
  }

  public error(title: string, message?: string, duration?: number): string {
    return this.show('error', title, message, duration || 5000);
  }

  public warning(title: string, message?: string, duration?: number): string {
    return this.show('warning', title, message, duration);
  }

  public info(title: string, message?: string, duration?: number): string {
    return this.show('info', title, message, duration);
  }

  public remove(id: string): void {
    const updated = this.toastsSubject.value.filter((t) => t.id !== id);
    this.toastsSubject.next(updated);
  }

  public clear(): void {
    this.toastsSubject.next([]);
  }
}

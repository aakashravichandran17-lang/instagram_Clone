import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private counter = 0;

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  warning(message: string): void {
    this.add(message, 'warning');
  }

  private add(message: string, type: Toast['type']): void {
    const toast: Toast = { id: ++this.counter, message, type };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => this.remove(toast.id), 4000);
  }

  remove(id: number): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast toast-{{ toast.type }}"
        (click)="remove(toast.id)"
      >
        <i class="bi" [class]="getIcon(toast.type)"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: []
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-triangle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
  }
}

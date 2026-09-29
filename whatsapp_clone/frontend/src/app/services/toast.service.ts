import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**
 * Thin wrapper around ngx-toastr so the rest of the app keeps using a
 * single, consistent notification API. Global toast configuration
 * (position, timeout, progress bar, close button, duplicate prevention)
 * is registered in app.module.ts via ToastrModule.forRoot().
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title?: string): void {
    this.toastr.success(message, title);
  }

  error(message: string, title?: string): void {
    this.toastr.error(message, title);
  }

  info(message: string, title?: string): void {
    this.toastr.info(message, title);
  }

  warning(message: string, title?: string): void {
    this.toastr.warning(message, title);
  }
}

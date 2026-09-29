import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content" [style.max-width.px]="maxWidth">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h5 class="fw-bold mb-0">{{ title }}</h5>
          <button class="btn btn-ghost btn-icon" (click)="close.emit()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="p-3">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent {
  @Input() title = '';
  @Input() maxWidth = 500;
  @Output() close = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}

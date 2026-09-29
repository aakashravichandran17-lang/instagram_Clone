import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <div [ngSwitch]="type">
      <!-- Post skeleton -->
      <div *ngSwitchCase="'post'" class="card p-3 mb-3">
        <div class="d-flex align-items-center mb-3">
          <div class="skeleton skeleton-avatar"></div>
          <div class="ms-3 flex-grow-1">
            <div class="skeleton skeleton-text" style="width: 40%"></div>
            <div class="skeleton skeleton-text" style="width: 25%"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text" style="width: 90%"></div>
        <div class="skeleton skeleton-text" style="width: 70%"></div>
        <div class="skeleton skeleton-card mt-3"></div>
      </div>

      <!-- User skeleton -->
      <div *ngSwitchCase="'user'" class="d-flex align-items-center gap-3 p-2">
        <div class="skeleton skeleton-avatar"></div>
        <div class="flex-grow-1">
          <div class="skeleton skeleton-text" style="width: 60%"></div>
          <div class="skeleton skeleton-text" style="width: 40%"></div>
        </div>
      </div>

      <!-- Notification skeleton -->
      <div *ngSwitchCase="'notification'" class="d-flex align-items-center gap-3 p-3">
        <div class="skeleton skeleton-avatar"></div>
        <div class="flex-grow-1">
          <div class="skeleton skeleton-text" style="width: 80%"></div>
          <div class="skeleton skeleton-text" style="width: 50%"></div>
        </div>
      </div>

      <!-- Conversation skeleton -->
      <div *ngSwitchCase="'conversation'" class="d-flex align-items-center gap-3 p-3">
        <div class="skeleton skeleton-avatar"></div>
        <div class="flex-grow-1">
          <div class="skeleton skeleton-text" style="width: 50%"></div>
          <div class="skeleton skeleton-text" style="width: 70%"></div>
        </div>
      </div>

      <!-- Generic block -->
      <div *ngSwitchDefault>
        <div class="skeleton skeleton-text" style="width: 100%"></div>
        <div class="skeleton skeleton-text" style="width: 80%"></div>
        <div class="skeleton skeleton-text" style="width: 60%"></div>
      </div>
    </div>
  `,
  styles: []
})
export class SkeletonComponent {
  @Input() type: 'post' | 'user' | 'notification' | 'conversation' | 'generic' = 'generic';
}

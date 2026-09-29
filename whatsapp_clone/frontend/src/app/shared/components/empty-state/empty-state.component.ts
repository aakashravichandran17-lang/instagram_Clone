import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <i class="bi {{ icon }} empty-state-icon"></i>
      <h5 class="fw-semibold">{{ title }}</h5>
      <p class="empty-state-text">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'Nothing here yet';
  @Input() description = 'Check back later for updates.';
}

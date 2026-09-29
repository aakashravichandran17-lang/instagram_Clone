import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <div class="position-relative d-inline-block">
      <img
        *ngIf="image; else placeholder"
        [src]="image"
        [alt]="name"
        class="avatar"
        [class]="'avatar-' + size"
        (error)="onImageError($event)"
      />
      <ng-template #placeholder>
        <div
          class="avatar-placeholder"
          [class]="'avatar-' + size"
          [style.fontSize.px]="getFontSize()"
        >
          {{ getInitials() }}
        </div>
      </ng-template>
      <span *ngIf="showOnline && isOnline" class="badge-online"></span>
    </div>
  `,
  styles: []
})
export class AvatarComponent {
  @Input() image = '';
  @Input() name = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Input() showOnline = false;
  @Input() isOnline = false;

  private fallbackImage = '';

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallbackImage) {
      this.fallbackImage = '';
      img.removeAttribute('src');
      img.style.display = 'none';
      // Show placeholder by clearing the image binding
      this.image = '';
    }
  }

  getInitials(): string {
    if (!this.name) return '?';
    return this.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getFontSize(): number {
    const sizes: { [key: string]: number } = {
      xs: 11,
      sm: 13,
      md: 16,
      lg: 22,
      xl: 32,
      '2xl': 40
    };
    return sizes[this.size] || 16;
  }
}

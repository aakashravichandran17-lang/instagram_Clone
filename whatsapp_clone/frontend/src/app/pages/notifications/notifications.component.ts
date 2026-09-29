import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { Notification, NotificationType } from '../../models/notification.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  private subscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();

    // Real-time notifications
    this.subscription = this.socketService.newNotification$.subscribe(
      (notification) => {
        this.notifications.unshift(notification);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.data.notifications;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to load notifications');
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.isRead = true;
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
        this.toastService.success('All notifications marked as read');
      }
    });
  }

  getIcon(type: NotificationType): string {
    const icons: { [key: string]: string } = {
      follow: 'bi-person-plus',
      like: 'bi-heart-fill',
      comment: 'bi-chat-fill',
      message: 'bi-envelope-fill'
    };
    return icons[type] || 'bi-bell';
  }

  getIconColor(type: NotificationType): string {
    const colors: { [key: string]: string } = {
      follow: 'text-primary',
      like: 'text-danger',
      comment: 'text-success',
      message: 'text-info'
    };
    return colors[type] || 'text-muted';
  }
}

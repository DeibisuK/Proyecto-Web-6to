import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'default' | 'loading' | 'dismiss';

export interface NotificationPayload {
  message: string;
  type?: NotificationType;
  key?: string | number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private subject = new Subject<NotificationPayload>();

  notify(payload: NotificationPayload) {
    this.subject.next(payload);
  }

  success(message: string) {
    this.notify({ message, type: 'success' });
  }

  error(message: string) {
    this.notify({ message, type: 'error' });
  }

  loading(message: string, key?: string | number) {
    this.notify({ message, type: 'loading', key });
  }

  dismiss() {
    this.notify({ message: '', type: 'dismiss' });
  }

  onNotify(): Observable<NotificationPayload> {
    return this.subject.asObservable();
  }
}

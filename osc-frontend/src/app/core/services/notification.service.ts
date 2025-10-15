import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'default' | 'loading';

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

  onNotify(): Observable<NotificationPayload> {
    return this.subject.asObservable();
  }
}

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReactWrapperComponent } from './share/react-wrapper/react-wrapper.component';
import SuccessToaster from './core/react-components/notifications/success';
import { NotificationService, NotificationPayload } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactWrapperComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  title = 'osc-frontend';

  private notificationService = inject(NotificationService);
  private sub: Subscription | null = null;

  // React Toaster
  toasterComponent = SuccessToaster;
  toasterProps: any = {};

  ngOnInit() {
    this.sub = this.notificationService.onNotify().subscribe((p: NotificationPayload) => {
      this.toasterProps = { message: p.message, type: p.type || 'default'};
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}

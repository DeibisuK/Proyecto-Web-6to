import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-torneo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-torneo.html',
  styleUrls: ['./dashboard-torneo.css']
})
export class DashboardTorneo {
  activeTab: string = 'torneos';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}

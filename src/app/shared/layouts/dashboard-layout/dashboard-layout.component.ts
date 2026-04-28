import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebarComponent } from '../../components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardSidebarComponent, DashboardHeaderComponent, NotificationPanelComponent],
  template: `
    <div class="dashboard-container">

      <app-dashboard-sidebar 
        [isOpen]="isSidebarMobileOpen" 
        [isCollapsed]="isSidebarCollapsed"
        (toggleCollapse)="isSidebarMobileOpen = false">
      </app-dashboard-sidebar>
      
      <main class="dash-main">
        <app-dashboard-header 
          (toggleSidebar)="toggleSidebar()" 
          (toggleNotifications)="showNotifications = !showNotifications">
        </app-dashboard-header>
        
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>

      <app-notification-panel 
        [isOpen]="showNotifications" 
        (close)="showNotifications = false">
      </app-notification-panel>

      <!-- Mobile Overlay -->
      <div class="mobile-overlay" *ngIf="isSidebarMobileOpen" (click)="isSidebarMobileOpen = false"></div>
    </div>
  `,
  styleUrls: ['../../styles/dashboard.css'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardLayoutComponent {
  isSidebarMobileOpen = false;
  isSidebarCollapsed = false;
  showNotifications = false;

  toggleSidebar() {
    if (window.innerWidth <= 1024) {
      this.isSidebarMobileOpen = !this.isSidebarMobileOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  toggleSidebarMobile() {
    this.isSidebarMobileOpen = !this.isSidebarMobileOpen;
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}

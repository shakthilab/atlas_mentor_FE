import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Manage your account preferences and system configurations.</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Sidebar Navigation -->
        <div class="settings-nav shadow-smooth">
          <div class="nav-item active">
            <span class="material-icons">person</span>
            <span>Profile Settings</span>
          </div>
          <div class="nav-item">
            <span class="material-icons">lock</span>
            <span>Security & Password</span>
          </div>
          <div class="nav-item">
            <span class="material-icons">notifications</span>
            <span>Notifications</span>
          </div>
          <div class="nav-item">
            <span class="material-icons">admin_panel_settings</span>
            <span>System Settings</span>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          <div class="content-card shadow-premium">
            <h3 class="section-title">Profile Information</h3>
            <div class="profile-upload">
              <div class="avatar-box">AD</div>
              <div class="upload-info">
                 <button class="btn btn-secondary btn-sm">Change Avatar</button>
                 <span class="text-xs">JPG or PNG, max 2MB</span>
              </div>
            </div>

            <form class="settings-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" value="System" class="form-control">
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" value="Administrator" class="form-control">
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" value="admin&#64;atlas-mentor.com" class="form-control">
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value="+91 9998887770" class="form-control">
                </div>
              </div>
              
              <div class="form-footer">
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>

          <div class="content-card shadow-premium mt-2">
            <h3 class="section-title">Password Management</h3>
            <form class="settings-form">
              <div class="form-grid">
                 <div class="form-group full">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" class="form-control">
                </div>
                <div class="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" class="form-control">
                </div>
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" class="form-control">
                </div>
              </div>
              <div class="form-footer">
                <button type="submit" class="btn btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    .module-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }

    .settings-grid { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; }
    
    .settings-nav { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 0.75rem; align-self: start; box-shadow: var(--shadow-sm); }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem; border-radius: var(--radius-md); cursor: pointer; color: var(--color-gray-700); font-size: 0.875rem; font-weight: 600; transition: all var(--transition-fast); }
    .nav-item i { font-size: 20px; color: var(--color-gray-400); }
    .nav-item:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
    .nav-item.active { background: var(--color-primary-light); color: var(--color-primary); }
    .nav-item.active i { color: var(--color-primary); }

    .settings-content { display: flex; flex-direction: column; gap: 2rem; }
    .content-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 2rem; box-shadow: var(--shadow-sm); }
    .section-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-gray-200); }

    .profile-upload { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
    .avatar-box { width: 80px; height: 80px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; border: 1px solid var(--color-primary-border); }
    .upload-info { display: flex; flex-direction: column; gap: 0.5rem; }

    .text-xs { font-size: 0.75rem; color: var(--dash-text-muted); }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group.full { grid-column: span 2; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-gray-700); }
    .form-control { padding: 0.625rem 0.875rem; border-radius: var(--radius-md); border: 1px solid var(--color-gray-300); background: white; font-size: 0.95rem; outline: none; transition: all var(--transition-fast); box-shadow: var(--shadow-xs); color: var(--color-gray-900); }
    .form-control:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }

    .form-footer { margin-top: 2.5rem; display: flex; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--color-gray-200); }

    @media (max-width: 1024px) {
      .settings-grid { grid-template-columns: 1fr; }
      .settings-nav { display: none; }
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full { grid-column: auto; }
    }
  `]
})
export class SettingsComponent {}

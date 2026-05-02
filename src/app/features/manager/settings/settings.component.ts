import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-manager-settings",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>Branch Settings</h1>
      <p>Manage settings for your branch - Coming soon!</p>
    </div>
  `,
  styles: [`
    .module-container {
      padding: 1.5rem;
      background: var(--color-gray-50);
      min-height: 100vh;
    }
  `]
})
export class ManagerSettingsComponent {}

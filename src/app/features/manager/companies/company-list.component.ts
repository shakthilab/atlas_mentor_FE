import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-manager-company-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>Branch Companies</h1>
      <p>Manage companies for your branch - Coming soon!</p>
    </div>
  `,
  styles: [`
   
  `]
})
export class ManagerCompanyListComponent {}

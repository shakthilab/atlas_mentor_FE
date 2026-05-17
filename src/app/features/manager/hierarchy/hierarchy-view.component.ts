import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-manager-hierarchy-view",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>Branch Hierarchy</h1>
      <p>View hierarchy for your branch - Coming soon!</p>
    </div>
  `,
  styles: [`
   
  `]
})
export class ManagerHierarchyViewComponent {}

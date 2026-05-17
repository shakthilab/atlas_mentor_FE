import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-lead-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>Branch Leads</h1>
      <p>Manage leads for your branch - Coming soon!</p>
    </div>
  `,
  styles: [`
   
  `]
})
export class ManagerLeadListComponent {}

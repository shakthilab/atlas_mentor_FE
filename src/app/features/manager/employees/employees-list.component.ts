import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-${dir%}-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>Branch ${dir^}</h1>
      <p>Manage ${dir} for your branch - Coming soon!</p>
    </div>
  `,
  styles: [`
   
  `]
})
export class Manager${dir^}ListComponent {}

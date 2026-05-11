import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-student-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>Branch Students</h1>
      <p>Manage students for your branch - Coming soon!</p>
    </div>
  `,
  styles: [`
   
  `]
})
export class ManagerStudentListComponent {}

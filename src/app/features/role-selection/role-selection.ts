import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.css',
})
export class RoleSelectionComponent {
  constructor(private router: Router) { }

  selectRole(role: 'admin' | 'trainer' | 'client'): void {
    if (role === 'admin') {
      // Admin can only login
      this.router.navigate(['/login', role]);
    } else {
      // Trainer and Client can choose login or register
      // We'll navigate to login and they can switch to register from there
      this.router.navigate(['/login', role]);
    }
  }
}

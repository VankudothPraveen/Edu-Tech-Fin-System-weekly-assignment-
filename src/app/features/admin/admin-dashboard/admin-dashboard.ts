import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    pendingClients: 0,
    pendingTrainers: 0,
    ongoingTrainings: 0,
    totalRevenue: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

    this.stats.pendingClients = clients.filter((c: any) => c.status === 'REQUESTED').length;
    this.stats.pendingTrainers = trainers.filter((t: any) => t.status === 'PENDING_APPROVAL').length;
    this.stats.ongoingTrainings = trainings.filter((t: any) => t.status === 'ONGOING').length;

    const paidInvoices = invoices.filter((i: any) => i.status === 'PAID' && i.type === 'CLIENT_INVOICE');
    this.stats.totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.guviMargin || 0), 0);
  }

  logout(): void {
    this.authService.logout();
  }
}

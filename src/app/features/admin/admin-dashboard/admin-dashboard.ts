import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { BusinessLogicService, DashboardStats } from '../../../shared/services/business-logic.service';

interface ActivityItem {
  id: string;
  description: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    pendingClients: 0,
    pendingTrainers: 0,
    ongoingTrainings: 0,
    completedTrainings: 0,
    totalRevenue: 0,
    pendingPOs: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    averageProgress: 0
  };

  clientChange = 0;
  trainerChange = 0;
  revenueChange = 0;
  recentActivities: ActivityItem[] = [];
  previousStats: DashboardStats | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private businessLogicService: BusinessLogicService
  ) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivities();
    this.calculateChanges();
  }

  loadStats(): void {
    this.stats = this.businessLogicService.getDashboardStats();
  }

  loadRecentActivities(): void {
    const activities: ActivityItem[] = [];
    
    // Load all data from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const pos = JSON.parse(localStorage.getItem('pos') || '[]');
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

    // Get recent clients (last 10)
    clients
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach((client: any) => {
        activities.push({
          id: `client-${client.id}`,
          description: `New client registration: ${client.name} (${client.companyName || 'Individual'})`,
          timestamp: new Date(client.createdAt),
          type: 'info'
        });
      });

    // Get recent trainers (last 10)
    trainers
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach((trainer: any) => {
        if (trainer.status === 'APPROVED' && trainer.approvedAt) {
          activities.push({
            id: `trainer-${trainer.id}`,
            description: `Trainer approved: ${trainer.name} - ${trainer.skills.join(', ')}`,
            timestamp: new Date(trainer.approvedAt),
            type: 'success'
          });
        } else if (trainer.status === 'PENDING_APPROVAL') {
          activities.push({
            id: `trainer-pending-${trainer.id}`,
            description: `New trainer application: ${trainer.name}`,
            timestamp: new Date(trainer.createdAt),
            type: 'info'
          });
        }
      });

    // Get recent trainings
    trainings
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach((training: any) => {
        const client = clients.find((c: any) => c.id === training.clientId);
        const trainer = trainers.find((t: any) => t.id === training.trainerId);
        
        if (training.status === 'ONGOING' && training.createdAt) {
          activities.push({
            id: `training-${training.id}`,
            description: `Training started: ${training.technology} - Client: ${client?.name || 'Unknown'}, Trainer: ${trainer?.name || 'Unknown'}`,
            timestamp: new Date(training.createdAt),
            type: 'success'
          });
        } else if (training.status === 'COMPLETED' && training.completedAt) {
          activities.push({
            id: `training-completed-${training.id}`,
            description: `Training completed: ${training.technology} by ${trainer?.name || 'Unknown'}`,
            timestamp: new Date(training.completedAt),
            type: 'success'
          });
        }
      });

    // Get recent POs
    pos
      .sort((a: any, b: any) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, 5)
      .forEach((po: any) => {
        if (po.type === 'CLIENT_PO') {
          const client = clients.find((c: any) => c.id === po.clientId);
          activities.push({
            id: `po-${po.id}`,
            description: `Purchase Order generated: ${po.poNumber} - ${client?.name || 'Unknown'} ($${po.amount})`,
            timestamp: new Date(po.generatedAt),
            type: 'info'
          });
        } else if (po.type === 'TRAINER_PO' && po.processedAt) {
          const trainer = trainers.find((t: any) => t.id === po.trainerId);
          activities.push({
            id: `po-trainer-${po.id}`,
            description: `Trainer PO processed: ${po.poNumber} - ${trainer?.name || 'Unknown'} ($${po.amount})`,
            timestamp: new Date(po.processedAt),
            type: 'success'
          });
        }
      });

    // Get recent invoices
    invoices
      .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5)
      .forEach((invoice: any) => {
        if (invoice.type === 'TRAINER_INVOICE') {
          const trainer = trainers.find((t: any) => t.id === invoice.trainerId);
          activities.push({
            id: `invoice-${invoice.id}`,
            description: `Invoice submitted: ${invoice.invoiceNumber} - ${trainer?.name || 'Unknown'} ($${invoice.trainerAmount})`,
            timestamp: new Date(invoice.submittedAt),
            type: 'info'
          });
        }
        
        if (invoice.status === 'PAID' && invoice.paidAt) {
          activities.push({
            id: `invoice-paid-${invoice.id}`,
            description: `Payment completed: ${invoice.invoiceNumber} ($${invoice.trainerAmount || invoice.clientAmount})`,
            timestamp: new Date(invoice.paidAt),
            type: 'success'
          });
        }
      });

    // Sort all activities by timestamp (most recent first) and take top 10
    this.recentActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    console.log('📋 Recent activities loaded:', this.recentActivities.length);
  }

  calculateChanges(): void {
    // Calculate real changes based on actual data
    if (this.previousStats) {
      this.clientChange = this.stats.pendingClients - this.previousStats.pendingClients;
      this.trainerChange = this.stats.pendingTrainers - this.previousStats.pendingTrainers;
      this.revenueChange = this.stats.totalRevenue - this.previousStats.totalRevenue;
    } else {
      // First time loading - check for today's additions
      this.clientChange = this.getTodayNewClients();
      this.trainerChange = this.getTodayNewTrainers();
      this.revenueChange = this.getTodayRevenue();
    }
    
    // Store current stats for next comparison
    this.previousStats = { ...this.stats };
  }

  getTodayNewClients(): number {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const today = new Date().toDateString();
    return clients.filter((client: any) => 
      client.status === 'REQUESTED' && 
      new Date(client.createdAt || Date.now()).toDateString() === today
    ).length;
  }

  getTodayNewTrainers(): number {
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const today = new Date().toDateString();
    return trainers.filter((trainer: any) => 
      trainer.status === 'PENDING_APPROVAL' && 
      new Date(trainer.createdAt || Date.now()).toDateString() === today
    ).length;
  }

  getTodayRevenue(): number {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const today = new Date().toDateString();
    return invoices
      .filter((invoice: any) => 
        invoice.status === 'PAID' && 
        new Date(invoice.paidAt || Date.now()).toDateString() === today
      )
      .reduce((sum: number, invoice: any) => sum + (invoice.amount || 0), 0);
  }

  refreshData(): void {
    console.log('🔄 Refreshing admin dashboard data...');
    
    // Log current localStorage state
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const pos = JSON.parse(localStorage.getItem('pos') || '[]');
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    
    console.log('📊 Data Summary:');
    console.log('  - Clients:', clients.length, clients.map((c: any) => ({ id: c.id, name: c.name, status: c.status })));
    console.log('  - Trainers:', trainers.length);
    console.log('  - POs:', pos.length, pos.map((p: any) => ({ type: p.type, clientId: p.clientId, trainerId: p.trainerId })));
    console.log('  - Trainings:', trainings.length);
    
    this.loadStats();
    this.loadRecentActivities();
    this.calculateChanges();
    
    console.log('✅ Data refreshed successfully');
  }

  exportToExcel(type: string): void {
    switch (type) {
      case 'clients':
        this.businessLogicService.exportClientsToExcel();
        break;
      case 'trainers':
        this.businessLogicService.exportTrainersToExcel();
        break;
      case 'purchaseOrders':
        this.businessLogicService.exportPurchaseOrdersToExcel();
        break;
      case 'invoices':
        this.businessLogicService.exportInvoicesToExcel();
        break;
      case 'progress':
        this.businessLogicService.exportProgressToExcel();
        break;
    }
  }

  generateReports(): void {
    console.log('📊 Generating monthly report...');
    
    // Get all data from localStorage
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const pos = JSON.parse(localStorage.getItem('pos') || '[]');
    
    // Calculate comprehensive statistics
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const reportData = {
      title: `Monthly Report - ${currentMonth}`,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Admin',
      
      summary: {
        totalTrainers: trainers.length,
        approvedTrainers: trainers.filter((t: any) => t.status === 'APPROVED').length,
        pendingTrainers: trainers.filter((t: any) => t.status === 'PENDING_APPROVAL').length,
        
        totalClients: clients.length,
        approvedClients: clients.filter((c: any) => c.status === 'APPROVED').length,
        pendingClients: clients.filter((c: any) => c.status === 'REQUESTED').length,
        
        totalTrainings: trainings.length,
        ongoingTrainings: trainings.filter((t: any) => t.status === 'ONGOING').length,
        completedTrainings: trainings.filter((t: any) => t.status === 'COMPLETED').length,
        
        totalInvoices: invoices.length,
        submittedInvoices: invoices.filter((i: any) => i.status === 'SUBMITTED').length,
        paidInvoices: invoices.filter((i: any) => i.status === 'PAID').length,
        
        totalPOs: pos.length,
        generatedPOs: pos.filter((p: any) => p.status === 'GENERATED').length,
      },
      
      dashboardStats: this.stats,
      recentActivities: this.recentActivities,
      
      financialSummary: {
        totalRevenue: this.stats.totalRevenue,
        pendingPayments: this.stats.pendingInvoices,
        overduePayments: this.stats.overdueInvoices
      }
    };

    // Generate PDF using HTML and print
    this.generatePDFReport(reportData, currentMonth);
    
    console.log('✅ Monthly report generated successfully!');
    console.log(reportData);
  }

  generatePDFReport(reportData: any, currentMonth: string): void {
    // Create a hidden iframe for PDF generation
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups to generate the PDF report.');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Report - ${currentMonth}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #3b82f6;
      margin: 0;
      font-size: 28px;
    }
    
    .header .subtitle {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .header .date {
      color: #999;
      font-size: 12px;
      margin-top: 10px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section h2 {
      color: #1e40af;
      font-size: 20px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    
    .stat-value.highlight {
      color: #3b82f6;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .table th {
      background: #f3f4f6;
      padding: 10px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
      border-bottom: 2px solid #d1d5db;
    }
    
    .table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    
    .summary-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 TECH FINANCIAL SYSTEM</h1>
    <div class="subtitle">Monthly Performance Report</div>
    <div class="date">Generated: ${new Date().toLocaleString()} | Period: ${currentMonth}</div>
  </div>

  <div class="section">
    <h2>👥 Trainers Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Trainers</div>
        <div class="stat-value highlight">${reportData.summary.totalTrainers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Approved</div>
        <div class="stat-value">${reportData.summary.approvedTrainers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Approval</div>
        <div class="stat-value">${reportData.summary.pendingTrainers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Approval Rate</div>
        <div class="stat-value">${reportData.summary.totalTrainers > 0 ? Math.round((reportData.summary.approvedTrainers / reportData.summary.totalTrainers) * 100) : 0}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🏢 Clients Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Clients</div>
        <div class="stat-value highlight">${reportData.summary.totalClients}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Approved</div>
        <div class="stat-value">${reportData.summary.approvedClients}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Requests</div>
        <div class="stat-value">${reportData.summary.pendingClients}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Approval Rate</div>
        <div class="stat-value">${reportData.summary.totalClients > 0 ? Math.round((reportData.summary.approvedClients / reportData.summary.totalClients) * 100) : 0}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📚 Trainings Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Trainings</div>
        <div class="stat-value highlight">${reportData.summary.totalTrainings}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ongoing</div>
        <div class="stat-value">${reportData.summary.ongoingTrainings}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Completed</div>
        <div class="stat-value">${reportData.summary.completedTrainings}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Completion Rate</div>
        <div class="stat-value">${reportData.summary.totalTrainings > 0 ? Math.round((reportData.summary.completedTrainings / reportData.summary.totalTrainings) * 100) : 0}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>💰 Financial Summary</h2>
    <div class="summary-box">
      <table class="table">
        <thead>
          <tr>
            <th>Metric</th>
            <th style="text-align: right;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Total Revenue</strong></td>
            <td style="text-align: right; color: #059669; font-weight: bold;">$${reportData.financialSummary.totalRevenue.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Total Invoices</td>
            <td style="text-align: right;">${reportData.summary.totalInvoices}</td>
          </tr>
          <tr>
            <td>Submitted Invoices</td>
            <td style="text-align: right;">${reportData.summary.submittedInvoices}</td>
          </tr>
          <tr>
            <td>Paid Invoices</td>
            <td style="text-align: right;">${reportData.summary.paidInvoices}</td>
          </tr>
          <tr>
            <td>Pending Payments</td>
            <td style="text-align: right; color: #f59e0b;">${reportData.financialSummary.pendingPayments}</td>
          </tr>
          <tr>
            <td>Overdue Payments</td>
            <td style="text-align: right; color: #dc2626;">${reportData.financialSummary.overduePayments}</td>
          </tr>
          <tr>
            <td>Total POs Generated</td>
            <td style="text-align: right;">${reportData.summary.totalPOs}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <h2>📊 Dashboard Statistics</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Metric</th>
          <th style="text-align: right;">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Pending Client Requests</td>
          <td style="text-align: right;">${reportData.dashboardStats.pendingClients}</td>
        </tr>
        <tr>
          <td>Pending Trainer Requests</td>
          <td style="text-align: right;">${reportData.dashboardStats.pendingTrainers}</td>
        </tr>
        <tr>
          <td>Ongoing Trainings</td>
          <td style="text-align: right;">${reportData.dashboardStats.ongoingTrainings}</td>
        </tr>
        <tr>
          <td>Completed Trainings</td>
          <td style="text-align: right;">${reportData.dashboardStats.completedTrainings}</td>
        </tr>
        <tr>
          <td>Average Progress</td>
          <td style="text-align: right;">${reportData.dashboardStats.averageProgress}%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>Tech Financial System</strong> - Administrative Report</p>
    <p>This report is confidential and intended for internal use only.</p>
    <p>© ${new Date().getFullYear()} GUVI Tech Financial System. All rights reserved.</p>
  </div>

  <div class="no-print" style="position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <button onclick="window.print()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
      💾 Download as PDF
    </button>
    <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin-left: 10px;">
      ✖ Close
    </button>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-trigger print dialog after content loads
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        // Don't auto-print, let user click the button
      }, 500);
    };
    
    alert(`📊 Monthly Report Opened!\n\nA new window has opened with your report.\n\nClick "💾 Download as PDF" to save it as a PDF file.\n\nTip: In the print dialog, select "Save as PDF" as the printer.`);
  }

  sendReminders(): void {
    console.log('📧 Sending payment reminders...');
    
    // Get all invoices and clients
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    
    // Find overdue/pending invoices
    const pendingInvoices = invoices.filter((inv: any) => 
      inv.status === 'SUBMITTED' || inv.status === 'PENDING'
    );
    
    if (pendingInvoices.length === 0) {
      alert('✅ No pending invoices found!\n\nAll invoices are either paid or there are no invoices in the system.');
      return;
    }
    
    // Group invoices by recipient
    const clientInvoices = pendingInvoices.filter((inv: any) => inv.type === 'CLIENT_INVOICE');
    const trainerInvoices = pendingInvoices.filter((inv: any) => inv.type === 'TRAINER_INVOICE');
    
    // Create detailed reminder list
    const remindersList: string[] = [];
    
    clientInvoices.forEach((invoice: any) => {
      const client = clients.find((c: any) => c.id === invoice.clientId);
      if (client) {
        remindersList.push(`Client: ${client.name} - Invoice: ${invoice.invoiceNumber} - Amount: $${invoice.clientAmount || invoice.amount}`);
        
        // Simulate sending notification
        this.authService.createNotification({
          recipientId: client.userId,
          recipientRole: 'client',
          message: `Payment reminder: Invoice ${invoice.invoiceNumber} is pending. Amount: $${invoice.clientAmount || invoice.amount}`,
          type: 'warning',
          timestamp: new Date(),
          read: false
        });
      }
    });
    
    trainerInvoices.forEach((invoice: any) => {
      const trainer = trainers.find((t: any) => t.id === invoice.trainerId);
      if (trainer) {
        remindersList.push(`Trainer: ${trainer.name} - Invoice: ${invoice.invoiceNumber} - Amount: $${invoice.trainerAmount || invoice.amount}`);
        
        // Notify trainer that payment is being processed
        this.authService.createNotification({
          recipientId: trainer.userId,
          recipientRole: 'trainer',
          message: `Your invoice ${invoice.invoiceNumber} for $${invoice.trainerAmount || invoice.amount} is being processed.`,
          type: 'info',
          timestamp: new Date(),
          read: false
        });
      }
    });
    
    // Log to console
    console.log('📋 Payment Reminders Sent:');
    remindersList.forEach(reminder => console.log('  •', reminder));
    
    // Show detailed alert
    const reminderMessage = `📧 Payment Reminders Sent!\n\n` +
      `Total Pending Invoices: ${pendingInvoices.length}\n` +
      `• Client Invoices: ${clientInvoices.length}\n` +
      `• Trainer Invoices: ${trainerInvoices.length}\n\n` +
      `Notifications sent to:\n${remindersList.slice(0, 5).join('\n')}` +
      (remindersList.length > 5 ? `\n... and ${remindersList.length - 5} more` : '');
    
    alert(reminderMessage);
    
    // Reload activities to show new reminders
    this.loadRecentActivities();
  }

  navigateToOngoingTrainings(): void {
    this.router.navigate(['/admin/progress-tracking']);
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    return timestamp.toLocaleDateString();
  }

  logout(): void {
    this.authService.logout();
  }
}

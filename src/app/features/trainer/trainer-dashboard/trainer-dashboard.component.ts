import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth-service';
import { Trainer } from '../../../models/trainer';
import { Training } from '../../../models/training';
import { Invoice } from '../../../models/invoice';
import { NotificationService } from '../../../shared/notification.service';

@Component({
    selector: 'app-trainer-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './trainer-dashboard.component.html',
    styleUrl: './trainer-dashboard.component.css'
})
export class TrainerDashboardComponent implements OnInit {
    trainer: Trainer | null = null;
    assignedTrainings: Training[] = [];
    completedTrainings: Training[] = [];
    totalEarnings = 0;
    submittedInvoices: Invoice[] = [];

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadTrainerData();
        this.loadInvoices();
    }

    loadTrainerData(): void {
        const userId = this.authService.getUserId();
        if (!userId) return;

        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        this.trainer = trainers.find((t: Trainer) => t.userId === userId);

        if (this.trainer) {
            const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
            const myTrainings = trainings.filter((t: Training) => t.trainerId === this.trainer!.id);

            this.assignedTrainings = myTrainings.filter((t: Training) => t.status === 'ONGOING');
            this.completedTrainings = myTrainings.filter((t: Training) => t.status === 'COMPLETED');

            // Calculate earnings (simplified)
            this.totalEarnings = this.completedTrainings.length * (this.trainer.expectedRate * 100);
        }
    }

    loadInvoices(): void {
        if (!this.trainer) return;

        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        this.submittedInvoices = invoices.filter((inv: Invoice) =>
            inv.trainerId === this.trainer!.id && inv.type === 'TRAINER_INVOICE'
        );
    }

    hasInvoice(trainingId: string): boolean {
        return this.submittedInvoices.some(inv => inv.trainingId === trainingId);
    }

    submitInvoice(training: Training): void {
        if (!this.trainer) return;

        if (this.hasInvoice(training.id)) {
            this.notificationService.warning('Invoice already submitted for this training');
            return;
        }

        const amount = prompt('Enter invoice amount ($):');
        if (!amount || isNaN(Number(amount))) {
            this.notificationService.error('Please enter a valid amount');
            return;
        }

        const invoiceNumber = `INV-TRAINER-${Date.now()}`;
        const newInvoice: Invoice = {
            id: `inv_${Date.now()}`,
            invoiceNumber: invoiceNumber,
            type: 'TRAINER_INVOICE',
            trainingId: training.id,
            trainerId: this.trainer.id,
            trainerAmount: Number(amount),
            description: `Invoice for ${training.technology} training - ${training.duration}`,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString()
        };

        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoices.push(newInvoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        this.loadInvoices();
        this.notificationService.success(`Invoice Submitted Successfully! Invoice Number: ${invoiceNumber}, Amount: $${amount}`);
    }

    getClientName(clientId: string): string {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find((c: any) => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    }

    getInvoiceStatus(trainingId: string): string {
        const invoice = this.submittedInvoices.find(inv => inv.trainingId === trainingId);
        return invoice ? invoice.status : '';
    }

    logout(): void {
        this.authService.logout();
    }
}

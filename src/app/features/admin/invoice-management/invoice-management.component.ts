import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Invoice } from '../../../models/invoice';
import { Training } from '../../../models/training';
import { Trainer } from '../../../models/trainer';
import { Client } from '../../../models/client';
import { NotificationService } from '../../../shared/notification.service';

@Component({
    selector: 'app-invoice-management',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './invoice-management.component.html',
    styleUrl: './invoice-management.component.css'
})
export class InvoiceManagementComponent implements OnInit {
    trainerInvoices: Invoice[] = [];
    clientInvoices: Invoice[] = [];
    activeTab: 'trainer' | 'client' = 'trainer';
    profitMarginPercent = 20; // 20% profit margin

    constructor(private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.loadInvoices();
    }

    loadInvoices(): void {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        this.trainerInvoices = invoices.filter((inv: Invoice) => inv.type === 'TRAINER_INVOICE');
        this.clientInvoices = invoices.filter((inv: Invoice) => inv.type === 'CLIENT_INVOICE');
    }

    getTrainerName(trainerId: string): string {
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        const trainer = trainers.find((t: Trainer) => t.id === trainerId);
        return trainer ? trainer.name : 'Unknown Trainer';
    }

    getClientName(clientId: string): string {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find((c: Client) => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    }

    getTrainingInfo(trainingId: string): string {
        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        const training = trainings.find((t: Training) => t.id === trainingId);
        return training ? `${training.technology} - ${training.duration}` : 'N/A';
    }

    getClientIdFromTraining(trainingId: string): string {
        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        const training = trainings.find((t: Training) => t.id === trainingId);
        return training ? training.clientId : '';
    }

    calculateProfit(trainerAmount: number): number {
        return Math.round(trainerAmount * (this.profitMarginPercent / 100));
    }

    calculateClientAmount(trainerAmount: number): number {
        return trainerAmount + this.calculateProfit(trainerAmount);
    }

    canGenerateClientInvoice(trainerInvoice: Invoice): boolean {
        // Check if client invoice already exists for this training
        const existingClientInvoice = this.clientInvoices.find(
            inv => inv.trainingId === trainerInvoice.trainingId
        );
        return !existingClientInvoice && trainerInvoice.status === 'SUBMITTED';
    }

    approveAndGenerateClientInvoice(trainerInvoice: Invoice): void {
        if (!this.canGenerateClientInvoice(trainerInvoice)) {
            this.notificationService.error('Cannot generate client invoice for this training');
            return;
        }

        const trainerAmount = trainerInvoice.trainerAmount || 0;
        const guviMargin = this.calculateProfit(trainerAmount);
        const clientAmount = this.calculateClientAmount(trainerAmount);
        const clientId = this.getClientIdFromTraining(trainerInvoice.trainingId);

        if (!clientId) {
            this.notificationService.error('Client not found for this training');
            return;
        }

        // Update trainer invoice status to APPROVED
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const trainerInvIndex = invoices.findIndex((inv: Invoice) => inv.id === trainerInvoice.id);
        if (trainerInvIndex !== -1) {
            invoices[trainerInvIndex].status = 'APPROVED';
            invoices[trainerInvIndex].approvedAt = new Date().toISOString();
        }

        // Generate client invoice
        const clientInvoiceNumber = `INV-CLIENT-${Date.now()}`;
        const newClientInvoice: Invoice = {
            id: `inv_${Date.now()}`,
            invoiceNumber: clientInvoiceNumber,
            type: 'CLIENT_INVOICE',
            trainingId: trainerInvoice.trainingId,
            clientId: clientId,
            trainerAmount: trainerAmount,
            guviMargin: guviMargin,
            clientAmount: clientAmount,
            description: `Invoice for ${this.getTrainingInfo(trainerInvoice.trainingId)}`,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString()
        };

        invoices.push(newClientInvoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        this.loadInvoices();
        this.notificationService.success(`Success! Trainer Invoice Approved. Client Invoice Generated: ${clientInvoiceNumber}. Trainer: $${trainerAmount}, GUVI Margin (${this.profitMarginPercent}%): $${guviMargin}, Client: $${clientAmount}`);
    }

    getPendingTrainerInvoices(): Invoice[] {
        return this.trainerInvoices.filter(inv => inv.status === 'SUBMITTED');
    }

    getApprovedTrainerInvoices(): Invoice[] {
        return this.trainerInvoices.filter(inv => inv.status === 'APPROVED');
    }
}

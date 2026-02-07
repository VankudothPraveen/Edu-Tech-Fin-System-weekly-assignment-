import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth-service';
import { Trainer } from '../../../models/trainer';
import { Training, Milestone } from '../../../models/training';
import { Invoice } from '../../../models/invoice';
import { PO } from '../../../models/po-model';
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
    trainerPOs: PO[] = [];

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadTrainerData();
        this.loadInvoices();
        this.loadPOs();
    }

    refreshData(): void {
        console.log('🔄 Refreshing trainer dashboard data...');
        this.loadTrainerData();
        this.loadInvoices();
        this.loadPOs();
        console.log('✅ Trainer POs loaded:', this.trainerPOs);
        console.log('✅ Completed trainings:', this.completedTrainings);
        this.notificationService.success('Data refreshed successfully');
    }

    loadTrainerData(): void {
        const userId = this.authService.getUserId();
        if (!userId) return;

        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        this.trainer = trainers.find((t: Trainer) => t.userId === userId);

        if (this.trainer) {
            console.log('👤 Trainer loaded:', this.trainer.name, 'ID:', this.trainer.id);
            
            const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
            const myTrainings = trainings.filter((t: Training) => t.trainerId === this.trainer!.id);

            this.assignedTrainings = myTrainings.filter((t: Training) => t.status === 'ONGOING');
            this.completedTrainings = myTrainings.filter((t: Training) => t.status === 'COMPLETED');

            console.log('📚 Trainings - Ongoing:', this.assignedTrainings.length, 'Completed:', this.completedTrainings.length);

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
        console.log('📄 Invoices loaded:', this.submittedInvoices.length);
    }

    loadPOs(): void {
        if (!this.trainer) {
            console.warn('⚠️ Cannot load POs: trainer not found');
            return;
        }

        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        console.log('📦 All POs in localStorage:', pos.length);
        console.log('🔍 Looking for trainer ID:', this.trainer.id);
        
        this.trainerPOs = pos.filter((po: PO) => 
            po.trainerId === this.trainer!.id && po.type === 'TRAINER_PO'
        );
        
        console.log('✅ Trainer POs found:', this.trainerPOs.length);
        if (this.trainerPOs.length > 0) {
            console.log('PO Details:', this.trainerPOs.map(po => ({
                poNumber: po.poNumber,
                trainerId: po.trainerId,
                trainingId: po.trainingId,
                amount: po.amount
            })));
        }
    }

    hasInvoice(trainingId: string): boolean {
        return this.submittedInvoices.some(inv => inv.trainingId === trainingId);
    }

    canGenerateInvoice(training: Training): boolean {
        // Check if training is completed
        if (training.status !== 'COMPLETED') return false;
        
        // Check if training is verified by client
        if (!training.verifiedByClient) return false;
        
        // Check if all milestones are completed
        if (training.milestones && training.milestones.length > 0) {
            const allMilestonesCompleted = training.milestones.every(m => m.status === 'COMPLETED');
            if (!allMilestonesCompleted) return false;
        }
        
        // Check if trainer PO exists for this training
        const hasTrainerPO = this.trainerPOs.some(po => po.trainingId === training.id);
        if (!hasTrainerPO) return false;
        
        // Check if invoice already submitted
        if (this.hasInvoice(training.id)) return false;
        
        return true;
    }

    getTrainerPO(trainingId: string): PO | undefined {
        return this.trainerPOs.find(po => po.trainingId === trainingId);
    }

    submitInvoice(training: Training): void {
        if (!this.trainer) return;

        // Validation checks
        if (!training.verifiedByClient) {
            alert('❌ Cannot Generate Invoice\n\nTraining must be verified by the client first.\n\nPlease wait for client to verify the training completion.');
            this.notificationService.error('Training not verified by client yet');
            return;
        }

        const trainerPO = this.getTrainerPO(training.id);
        if (!trainerPO) {
            alert('❌ Cannot Generate Invoice\n\nNo Purchase Order found for this training.\n\nPlease contact the admin to generate a PO first.');
            this.notificationService.error('No PO found for this training');
            return;
        }

        if (this.hasInvoice(training.id)) {
            this.notificationService.warning('Invoice already submitted for this training');
            return;
        }

        // Use PO amount as default invoice amount
        const invoiceAmount = trainerPO.amount;
        
        const invoiceNumber = `INV-TRAINER-${Date.now()}`;
        const newInvoice: Invoice = {
            id: `inv_${Date.now()}`,
            invoiceNumber: invoiceNumber,
            type: 'TRAINER_INVOICE',
            trainingId: training.id,
            trainerId: this.trainer.id,
            trainerAmount: invoiceAmount,
            description: `Invoice for ${training.technology} training - ${training.duration} (PO: ${trainerPO.poNumber})`,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString()
        };

        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoices.push(newInvoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        // Notify admin
        this.authService.createNotification({
            recipientId: 'admin-001',
            recipientRole: 'admin',
            message: `New Invoice Submitted by ${this.trainer.name}. Invoice: ${invoiceNumber}, Amount: $${invoiceAmount}`,
            type: 'info',
            timestamp: new Date(),
            read: false
        });

        this.loadInvoices();
        
        // Success message with details
        alert(`✅ Invoice Generated Successfully!\n\n` +
              `Invoice Number: ${invoiceNumber}\n` +
              `Training: ${training.technology}\n` +
              `Duration: ${training.duration}\n` +
              `Amount: $${invoiceAmount}\n` +
              `PO Reference: ${trainerPO.poNumber}\n\n` +
              `Admin has been notified!`);

        this.notificationService.success(`Invoice submitted successfully! Invoice #${invoiceNumber}`);
    }

    getClientName(clientId: string): string {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find((c: any) => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    }

    getTrainingDetails(trainingId: string): Training | undefined {
        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        return trainings.find((t: Training) => t.id === trainingId);
    }

    getInvoiceStatus(trainingId: string): string {
        const invoice = this.submittedInvoices.find(inv => inv.trainingId === trainingId);
        return invoice ? invoice.status : '';
    }

    remindPayment(invoice: Invoice): void {
        if (!this.trainer) return;

        // Send reminder to admin
        this.authService.createNotification({
            recipientId: 'admin-001',
            recipientRole: 'admin',
            message: `Payment Reminder: Invoice ${invoice.invoiceNumber} from ${this.trainer.name} is pending. Amount: $${invoice.trainerAmount}`,
            type: 'warning',
            timestamp: new Date(),
            read: false
        });

        alert(`✅ Payment Reminder Sent!\n\nInvoice: ${invoice.invoiceNumber}\nAmount: $${invoice.trainerAmount}\n\nAdmin has been notified about the pending payment.`);
        this.notificationService.success('Payment reminder sent to admin');
    }

    verifyMilestone(training: Training, milestone: Milestone): void {
        if (milestone.status !== 'IN_PROGRESS') {
            alert('⚠️ Cannot Verify\n\nThis milestone has not been marked as complete by the client yet.');
            return;
        }

        if (milestone.completedBy !== 'client') {
            alert('⚠️ Cannot Verify\n\nThis milestone must be completed by the client first.');
            return;
        }

        const confirmMsg = `Verify this milestone as completed?\n\n` +
                          `Module: ${milestone.title}\n` +
                          `Month: ${milestone.month}\n` +
                          `Completed by client on: ${milestone.completedAt ? new Date(milestone.completedAt).toLocaleDateString() : 'N/A'}`;
        
        if (!confirm(confirmMsg)) return;

        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        const trainingIndex = trainings.findIndex((t: Training) => t.id === training.id);
        
        if (trainingIndex === -1) return;

        // Find and update the milestone
        const milestoneIndex = trainings[trainingIndex].milestones?.findIndex((m: Milestone) => m.id === milestone.id);
        
        if (milestoneIndex !== undefined && milestoneIndex !== -1) {
            trainings[trainingIndex].milestones[milestoneIndex].status = 'COMPLETED';

            // Update progress tracking
            const completedCount = trainings[trainingIndex].milestones.filter((m: Milestone) => m.status === 'COMPLETED').length;
            trainings[trainingIndex].completedMilestones = completedCount;
            trainings[trainingIndex].progressPercentage = Math.round((completedCount / trainings[trainingIndex].totalMilestones) * 100);

            // Check if all milestones are completed
            const allCompleted = trainings[trainingIndex].milestones.every((m: Milestone) => m.status === 'COMPLETED');
            if (allCompleted) {
                trainings[trainingIndex].status = 'COMPLETED';
                trainings[trainingIndex].completedAt = new Date().toISOString();
            }

            localStorage.setItem('trainings', JSON.stringify(trainings));

            // Notify client
            this.authService.createNotification({
                recipientId: training.clientId,
                recipientRole: 'client',
                message: `Milestone verified: ${milestone.title}. Progress: ${trainings[trainingIndex].progressPercentage}%`,
                type: 'success',
                timestamp: new Date(),
                read: false
            });

            // Notify admin
            this.authService.createNotification({
                recipientId: 'admin-001',
                recipientRole: 'admin',
                message: `Milestone verified: ${this.trainer?.name} verified "${milestone.title}" for ${training.technology}`,
                type: 'info',
                timestamp: new Date(),
                read: false
            });

            let alertMsg = `✅ Milestone Verified!\n\n${milestone.title}\n\nProgress: ${trainings[trainingIndex].progressPercentage}%`;
            
            if (allCompleted) {
                alertMsg += '\n\n🎉 All milestones completed! Training marked as COMPLETED.\nYou can now generate an invoice once the client verifies.';
            }

            alert(alertMsg);
            this.loadTrainerData();
        }
    }

    canVerifyMilestone(milestone: Milestone): boolean {
        return milestone.status === 'IN_PROGRESS' && milestone.completedBy === 'client';
    }

    getMilestoneStatusClass(status: string): string {
        switch(status) {
            case 'COMPLETED': return 'badge-completed';
            case 'IN_PROGRESS': return 'badge-ongoing';
            case 'PENDING': return 'badge-requested';
            default: return 'badge-requested';
        }
    }

    getMilestoneStatusText(status: string): string {
        switch(status) {
            case 'COMPLETED': return 'Verified';
            case 'IN_PROGRESS': return 'Awaiting Verification';
            case 'PENDING': return 'Pending';
            default: return status;
        }
    }

    logout(): void {
        this.authService.logout();
    }
}

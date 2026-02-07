import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PO } from '../../../models/po-model';
import { Client } from '../../../models/client';
import { Trainer } from '../../../models/trainer';
import { Training } from '../../../models/training';
import { NotificationService } from '../../../shared/notification.service';
import { AuthService } from '../../../auth/auth-service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-po-management',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './po-management.component.html',
    styleUrl: './po-management.component.css'
})
export class PoManagementComponent implements OnInit, OnDestroy {
    clientPOs: PO[] = [];
    trainerPOs: PO[] = [];
    trainings: Training[] = [];
    clients: Client[] = [];
    trainers: Trainer[] = [];
    activeTab: 'client' | 'trainer' = 'client';
    
    // For processing client POs
    selectedPOForProcessing: PO | null = null;
    profitMarginPercent: number = 10;
    showProcessingModal: boolean = false;

    private routerSubscription?: Subscription;

    constructor(
        private notificationService: NotificationService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAllData();
        
        // Reload data when navigating back to this component
        this.routerSubscription = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            if (this.router.url.includes('/admin/po-management')) {
                console.log('PO Management page visited, reloading data...');
                this.loadAllData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }

    loadAllData(): void {
        this.loadClients();
        this.loadTrainers();
        this.loadPOs();
        this.loadTrainings();
    }

    loadClients(): void {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        this.clients = clients;
        console.log('Loaded clients in PO Management:', this.clients);
    }

    loadTrainers(): void {
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        this.trainers = trainers;
        console.log('Loaded trainers in PO Management:', this.trainers);
    }

    loadPOs(): void {
        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        this.clientPOs = pos.filter((po: PO) => po.type === 'CLIENT_PO');
        this.trainerPOs = pos.filter((po: PO) => po.type === 'TRAINER_PO');
        console.log('Loaded Client POs:', this.clientPOs);
        console.log('Loaded Trainer POs:', this.trainerPOs);
    }

    loadTrainings(): void {
        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        this.trainings = trainings;
    }

    getClientName(clientId: string): string {
        const client = this.clients.find((c: Client) => c.id === clientId);
        if (!client) {
            console.warn('Client not found for ID:', clientId);
            console.log('Available clients:', this.clients.map(c => ({ id: c.id, name: c.name })));
        }
        return client ? client.name : 'Unknown Client';
    }

    getTrainerName(trainerId: string): string {
        const trainer = this.trainers.find((t: Trainer) => t.id === trainerId);
        if (!trainer) {
            console.warn('Trainer not found for ID:', trainerId);
        }
        return trainer ? trainer.name : 'Unknown Trainer';
    }

    getTrainingInfo(trainingId: string): string {
        const training = this.trainings.find((t: Training) => t.id === trainingId);
        return training ? `${training.technology} - ${training.duration}` : 'N/A';
    }

    canGenerateTrainerPO(training: Training): boolean {
        // Check if trainer PO already exists for this training
        const existingPO = this.trainerPOs.find(po => po.trainingId === training.id);
        return !existingPO && training.status === 'ONGOING';
    }

    generateTrainerPO(training: Training): void {
        if (!this.canGenerateTrainerPO(training)) {
            this.notificationService.error('Cannot generate trainer PO for this training');
            return;
        }

        // Get trainer details
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        const trainer = trainers.find((t: Trainer) => t.id === training.trainerId);

        if (!trainer) {
            this.notificationService.error('Trainer not found');
            return;
        }

        const poNumber = `PO-TRAINER-${Date.now()}`;
        const newPO: PO = {
            id: `po_${Date.now()}`,
            poNumber: poNumber,
            type: 'TRAINER_PO',
            trainingId: training.id,
            trainerId: training.trainerId,
            amount: trainer.expectedRate || 0,
            description: `Purchase Order for ${training.technology} training - ${training.duration}`,
            status: 'GENERATED',
            generatedAt: new Date().toISOString()
        };

        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        pos.push(newPO);
        localStorage.setItem('pos', JSON.stringify(pos));

        this.loadPOs();
        this.notificationService.success(`Trainer PO Generated! PO Number: ${poNumber}, Amount: $${newPO.amount}`);
    }

    getOngoingTrainings(): Training[] {
        return this.trainings.filter(t => t.status === 'ONGOING');
    }

    // Process client PO - Apply profit margin and create trainer PO
    openProcessingModal(po: PO): void {
        this.selectedPOForProcessing = po;
        this.profitMarginPercent = 10; // Default 10%
        this.showProcessingModal = true;
    }

    closeProcessingModal(): void {
        this.showProcessingModal = false;
        this.selectedPOForProcessing = null;
        this.profitMarginPercent = 10;
    }

    calculateTrainerAmount(): number {
        if (!this.selectedPOForProcessing) return 0;
        const adminProfit = (this.selectedPOForProcessing.amount * this.profitMarginPercent) / 100;
        return this.selectedPOForProcessing.amount - adminProfit;
    }

    calculateAdminProfit(): number {
        if (!this.selectedPOForProcessing) return 0;
        return (this.selectedPOForProcessing.amount * this.profitMarginPercent) / 100;
    }

    processClientPO(): void {
        if (!this.selectedPOForProcessing) {
            this.notificationService.error('No PO selected for processing');
            return;
        }

        // Get training details to create trainer PO
        const training = this.trainings.find(t => t.id === this.selectedPOForProcessing!.trainingId);
        if (!training) {
            this.notificationService.error('Associated training not found');
            return;
        }

        // Get trainer details
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        const trainer = trainers.find((t: Trainer) => t.id === training.trainerId);
        if (!trainer) {
            this.notificationService.error('Trainer not found');
            return;
        }

        const adminProfit = this.calculateAdminProfit();
        const trainerAmount = this.calculateTrainerAmount();

        // Update client PO status
        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        const clientPOIndex = pos.findIndex((p: PO) => p.id === this.selectedPOForProcessing!.id);
        
        if (clientPOIndex !== -1) {
            pos[clientPOIndex].status = 'PROCESSED';
            pos[clientPOIndex].processedAt = new Date().toISOString();
            pos[clientPOIndex].processedBy = 'admin';
            pos[clientPOIndex].profitMargin = this.profitMarginPercent;
            pos[clientPOIndex].adminProfit = adminProfit;
        }

        // Create Trainer PO with reduced amount
        const trainerPONumber = `PO-TRAINER-${Date.now()}`;
        const trainerPO: PO = {
            id: `po_trainer_${Date.now()}`,
            poNumber: trainerPONumber,
            type: 'TRAINER_PO',
            trainingId: training.id,
            trainerId: training.trainerId,
            clientPOId: this.selectedPOForProcessing.id,
            originalAmount: this.selectedPOForProcessing.amount,
            amount: trainerAmount,
            profitMargin: this.profitMarginPercent,
            adminProfit: adminProfit,
            description: `Purchase Order for ${training.technology} training - ${training.duration} (After ${this.profitMarginPercent}% admin margin)`,
            status: 'GENERATED',
            generatedAt: new Date().toISOString()
        };

        pos.push(trainerPO);
        localStorage.setItem('pos', JSON.stringify(pos));

        // Send notification to trainer
        this.authService.createNotification({
            recipientId: training.trainerId,
            recipientRole: 'trainer',
            message: `New Purchase Order Generated! PO: ${trainerPONumber}, Amount: $${trainerAmount}`,
            type: 'success',
            timestamp: new Date(),
            read: false
        });

        // Reload data
        this.loadPOs();
        this.closeProcessingModal();

        // Success message
        alert(`✅ Client PO Processed Successfully!\n\n` +
              `Client PO: ${this.selectedPOForProcessing.poNumber}\n` +
              `Original Amount: $${this.selectedPOForProcessing.amount}\n` +
              `Admin Profit (${this.profitMarginPercent}%): $${adminProfit.toFixed(2)}\n` +
              `Trainer PO: ${trainerPONumber}\n` +
              `Trainer Amount: $${trainerAmount.toFixed(2)}\n\n` +
              `Trainer has been notified!`);

        this.notificationService.success('Client PO processed and Trainer PO created successfully!');
    }
}

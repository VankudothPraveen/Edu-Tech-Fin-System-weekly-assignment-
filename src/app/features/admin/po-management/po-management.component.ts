import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PO } from '../../../models/po-model';
import { Client } from '../../../models/client';
import { Trainer } from '../../../models/trainer';
import { Training } from '../../../models/training';
import { NotificationService } from '../../../shared/notification.service';

@Component({
    selector: 'app-po-management',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './po-management.component.html',
    styleUrl: './po-management.component.css'
})
export class PoManagementComponent implements OnInit {
    clientPOs: PO[] = [];
    trainerPOs: PO[] = [];
    trainings: Training[] = [];
    activeTab: 'client' | 'trainer' = 'client';

    constructor(private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.loadPOs();
        this.loadTrainings();
    }

    loadPOs(): void {
        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        this.clientPOs = pos.filter((po: PO) => po.type === 'CLIENT_PO');
        this.trainerPOs = pos.filter((po: PO) => po.type === 'TRAINER_PO');
    }

    loadTrainings(): void {
        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        this.trainings = trainings;
    }

    getClientName(clientId: string): string {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find((c: Client) => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    }

    getTrainerName(trainerId: string): string {
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        const trainer = trainers.find((t: Trainer) => t.id === trainerId);
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
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { Client } from '../../../models/client';
import { Training } from '../../../models/training';
import { PO } from '../../../models/po-model';
import { NotificationService } from '../../../shared/notification.service';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './client-dashboard.component.html',
    styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
    client: Client | null = null;
    ongoingTrainings: Training[] = [];
    completedTrainings: Training[] = [];
    clientPO: PO | null = null;

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadClientData();
        this.loadClientPO();
    }

    loadClientData(): void {
        const userId = this.authService.getUserId();
        if (!userId) return;

        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        this.client = clients.find((c: Client) => c.userId === userId);

        if (this.client) {
            const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
            const myTrainings = trainings.filter((t: Training) => t.clientId === this.client!.id);

            this.ongoingTrainings = myTrainings.filter((t: Training) => t.status === 'ONGOING');
            this.completedTrainings = myTrainings.filter((t: Training) => t.status === 'COMPLETED');
        }
    }

    loadClientPO(): void {
        if (!this.client) return;

        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        this.clientPO = pos.find((po: PO) => po.clientId === this.client!.id && po.type === 'CLIENT_PO');
    }

    generatePO(): void {
        if (!this.client || this.client.status !== 'APPROVED') {
            this.notificationService.error('Only approved clients can generate PO');
            return;
        }

        if (this.clientPO) {
            this.notificationService.warning('PO already generated!');
            return;
        }

        const poNumber = `PO-CLIENT-${Date.now()}`;
        const newPO: PO = {
            id: `po_${Date.now()}`,
            poNumber: poNumber,
            type: 'CLIENT_PO',
            clientId: this.client.id,
            amount: this.client.budget || 0,
            description: `Purchase Order for ${this.client.technology} training - ${this.client.duration}`,
            status: 'GENERATED',
            generatedAt: new Date().toISOString()
        };

        const pos = JSON.parse(localStorage.getItem('pos') || '[]');
        pos.push(newPO);
        localStorage.setItem('pos', JSON.stringify(pos));

        this.clientPO = newPO;
        this.notificationService.success(`PO Generated Successfully! PO Number: ${poNumber}`);
    }

    getTrainerName(trainerId: string): string {
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
        const trainer = trainers.find((t: any) => t.id === trainerId);
        return trainer ? trainer.name : 'Unknown Trainer';
    }

    logout(): void {
        this.authService.logout();
    }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Trainer, TrainerStatus } from '../../../models/trainer';

@Component({
    selector: 'app-trainer-requests',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './trainer-requests.component.html',
    styleUrl: './trainer-requests.component.css'
})
export class TrainerRequestsComponent implements OnInit {
    trainers: Trainer[] = [];
    filteredTrainers: Trainer[] = [];
    filter: 'all' | TrainerStatus = 'all';

    ngOnInit(): void {
        this.loadTrainers();
    }

    loadTrainers(): void {
        const trainersData = localStorage.getItem('trainers');
        this.trainers = trainersData ? JSON.parse(trainersData) : [];
        this.applyFilter();
    }

    applyFilter(): void {
        if (this.filter === 'all') {
            this.filteredTrainers = this.trainers;
        } else {
            this.filteredTrainers = this.trainers.filter(t => t.status === this.filter);
        }
    }

    hireTrainer(trainer: Trainer): void {
        trainer.status = 'APPROVED';
        trainer.approvedAt = new Date().toISOString();
        this.saveTrainers();
        alert(`Trainer "${trainer.name}" has been hired! They can now be assigned to clients.`);
    }

    rejectTrainer(trainer: Trainer): void {
        if (confirm(`Are you sure you want to reject ${trainer.name}'s application?`)) {
            trainer.status = 'REJECTED';
            trainer.rejectedAt = new Date().toISOString();
            this.saveTrainers();
            alert(`Trainer "${trainer.name}" has been rejected.`);
        }
    }

    viewResume(trainer: Trainer): void {
        if (trainer.resumeBase64) {
            const win = window.open();
            if (win) {
                win.document.write(`<iframe src="${trainer.resumeBase64}" width="100%" height="100%"></iframe>`);
            }
        } else {
            alert('No resume available');
        }
    }

    private saveTrainers(): void {
        localStorage.setItem('trainers', JSON.stringify(this.trainers));
        this.applyFilter();
    }

    getStatusClass(status: TrainerStatus): string {
        return status === 'PENDING_APPROVAL' ? 'badge-pending' : `badge-${(status as string).toLowerCase()}`;
    }

    get pendingCount(): number {
        return this.trainers.filter(t => t.status === 'PENDING_APPROVAL').length;
    }

    get approvedCount(): number {
        return this.trainers.filter(t => t.status === 'APPROVED').length;
    }

    get rejectedCount(): number {
        return this.trainers.filter(t => t.status === 'REJECTED').length;
    }
}

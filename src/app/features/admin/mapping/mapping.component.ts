import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Client } from '../../../models/client';
import { Trainer } from '../../../models/trainer';
import { Training, TrainingStatus, Milestone } from '../../../models/training';

@Component({
    selector: 'app-mapping',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './mapping.component.html',
    styleUrl: './mapping.component.css'
})
export class MappingComponent implements OnInit {
    approvedClients: Client[] = [];
    approvedTrainers: Trainer[] = [];
    selectedClient: Client | null = null;
    selectedTrainer: Trainer | null = null;
    startDate = '';

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');

        this.approvedClients = clients.filter((c: Client) => c.status === 'APPROVED');
        this.approvedTrainers = trainers.filter((t: Trainer) => t.status === 'APPROVED');
    }

    selectClient(client: Client): void {
        this.selectedClient = client;
        this.suggestTrainers();
    }

    selectTrainer(trainer: Trainer): void {
        this.selectedTrainer = trainer;
    }

    suggestTrainers(): void {
        if (!this.selectedClient) return;

        // Simple skill matching - check if trainer has the required technology
        const clientTech = this.selectedClient.technology.toLowerCase();
        this.approvedTrainers.sort((a, b) => {
            const aMatch = a.skills.some(s => s.toLowerCase().includes(clientTech));
            const bMatch = b.skills.some(s => s.toLowerCase().includes(clientTech));
            return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
        });
    }

    hasMatchingSkill(trainer: Trainer): boolean {
        if (!this.selectedClient) return false;
        const clientTech = this.selectedClient.technology.toLowerCase();
        return trainer.skills.some(s => s.toLowerCase().includes(clientTech));
    }

    createMapping(): void {
        if (!this.selectedClient || !this.selectedTrainer || !this.startDate) {
            alert('Please select both client and trainer, and provide a start date');
            return;
        }

        const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');

        // Parse duration to extract number of months (e.g., "4 months" -> 4)
        const durationMatch = this.selectedClient.duration.match(/(\d+)\s*(month|months)/i);
        const durationMonths = durationMatch ? parseInt(durationMatch[1]) : 4; // Default to 4 months if parsing fails

        // Generate milestones based on duration
        const milestones: Milestone[] = [];
        const startDateObj = new Date(this.startDate);
        
        for (let i = 1; i <= durationMonths; i++) {
            const dueDate = new Date(startDateObj);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            milestones.push({
                id: `milestone-${Date.now()}-${i}`,
                trainingId: `training-${Date.now()}`,
                title: `Module ${i}: ${this.getMilestoneTitle(i, durationMonths)}`,
                description: `Complete ${this.getMilestoneDescription(i, durationMonths)} for ${this.selectedClient.technology}`,
                month: i,
                dueDate: dueDate.toISOString(),
                status: 'PENDING',
                completedAt: undefined,
                completedBy: undefined
            });
        }

        const training: Training = {
            id: `training-${Date.now()}`,
            clientId: this.selectedClient.id,
            trainerId: this.selectedTrainer.id,
            technology: this.selectedClient.technology,
            duration: this.selectedClient.duration,
            startDate: this.startDate,
            status: 'ONGOING' as TrainingStatus,
            createdAt: new Date().toISOString(),
            milestones: milestones,
            totalMilestones: durationMonths,
            completedMilestones: 0,
            progressPercentage: 0
        };

        trainings.push(training);
        localStorage.setItem('trainings', JSON.stringify(trainings));

        alert(`Training mapped successfully!\nClient: ${this.selectedClient.name}\nTrainer: ${this.selectedTrainer.name}\nTechnology: ${training.technology}\nMilestones Created: ${durationMonths}`);

        // Reset
        this.selectedClient = null;
        this.selectedTrainer = null;
        this.startDate = '';
        this.loadData();
    }

    getMilestoneTitle(month: number, totalMonths: number): string {
        if (totalMonths === 1) return 'Complete Course';
        if (month === 1) return 'Introduction & Fundamentals';
        if (month === totalMonths) return 'Advanced Topics & Project';
        if (month === Math.floor(totalMonths / 2)) return 'Core Concepts';
        return `Module ${month} Content`;
    }

    getMilestoneDescription(month: number, totalMonths: number): string {
        if (totalMonths === 1) return 'all course materials';
        if (month === 1) return 'foundational concepts and setup';
        if (month === totalMonths) return 'advanced topics and final project';
        if (month === Math.floor(totalMonths / 2)) return 'core concepts and practical exercises';
        return `Month ${month} curriculum and assignments`;
    }
}

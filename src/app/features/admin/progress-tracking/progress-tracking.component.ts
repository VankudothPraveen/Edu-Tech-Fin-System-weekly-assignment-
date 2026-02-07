import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { BusinessLogicService, TrainingProgress } from '../../../shared/services/business-logic.service';
import { Training, Milestone } from '../../../models/training';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-progress-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress-tracking.component.html',
  styleUrl: './progress-tracking.component.css'
})
export class ProgressTrackingComponent implements OnInit, OnDestroy {
  ongoingTrainings: TrainingProgress[] = [];
  completedTrainings: TrainingProgress[] = [];
  allTrainings: TrainingProgress[] = [];
  selectedTraining: TrainingProgress | null = null;
  isLoading = false;
  filter: 'all' | 'IN_PROGRESS' | 'COMPLETED' = 'all';
  
  // Dynamic metrics
  totalModules = 0;
  completedModules = 0;
  totalProgress = 0;
  activeClients = 0;
  activeTrainers = 0;
  averageProgress = 0;
  
  private destroy$ = new Subject<void>();
  private updateInterval$ = interval(5000); // Update every 5 seconds

  constructor(
    private authService: AuthService,
    private router: Router,
    private businessLogicService: BusinessLogicService
  ) {}

  ngOnInit(): void {
    this.loadTrainingProgress();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startRealTimeUpdates(): void {
    this.updateInterval$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.simulateTrainingProgress();
        this.updateDynamicMetrics();
      });
  }

  private simulateTrainingProgress(): void {
    // Simulate progress updates for ongoing trainings
    this.ongoingTrainings.forEach(training => {
      if (Math.random() > 0.7 && training.completedModules < training.totalModules) {
        // Randomly complete a module
        training.completedModules++;
        training.progressPercentage = (training.completedModules / training.totalModules) * 100;
        
        // Check if training is completed
        if (training.completedModules === training.totalModules) {
          training.status = 'COMPLETED';
          training.actualEndDate = new Date();
        }
        
        // Update milestones
        const nextMilestone = training.milestones.find(m => !m.completed);
        if (nextMilestone && Math.random() > 0.5) {
          nextMilestone.completed = true;
        }
      }
    });
    
    // Move completed trainings to completed array
    const newlyCompleted = this.ongoingTrainings.filter(t => t.status === 'COMPLETED');
    if (newlyCompleted.length > 0) {
      this.completedTrainings.push(...newlyCompleted);
      this.ongoingTrainings = this.ongoingTrainings.filter(t => t.status === 'IN_PROGRESS');
    }
    
    // Update all trainings array
    this.allTrainings = [...this.ongoingTrainings, ...this.completedTrainings];
  }

  private updateDynamicMetrics(): void {
    // Calculate total modules
    this.totalModules = this.allTrainings.reduce((sum, t) => sum + t.totalModules, 0);
    
    // Calculate completed modules
    this.completedModules = this.allTrainings.reduce((sum, t) => sum + t.completedModules, 0);
    
    // Calculate total progress
    this.totalProgress = this.allTrainings.length > 0 
      ? this.allTrainings.reduce((sum, t) => sum + t.progressPercentage, 0) / this.allTrainings.length 
      : 0;
    
    // Calculate active clients (unique)
    const clientIds = new Set(this.allTrainings.map(t => t.clientId));
    this.activeClients = clientIds.size;
    
    // Calculate active trainers (unique)
    const trainerIds = new Set(this.allTrainings.map(t => t.trainerId));
    this.activeTrainers = trainerIds.size;
    
    // Calculate average progress
    this.averageProgress = this.allTrainings.length > 0 
      ? this.allTrainings.reduce((sum, t) => sum + t.progressPercentage, 0) / this.allTrainings.length 
      : 0;
  }

  loadTrainingProgress(): void {
    this.isLoading = true;
    
    // Get real training data from localStorage
    const allProgress = this.getActualTrainingData();
    
    // Separate ongoing and completed trainings
    this.ongoingTrainings = allProgress.filter(t => t.status === 'IN_PROGRESS');
    this.completedTrainings = allProgress.filter(t => t.status === 'COMPLETED');
    this.allTrainings = allProgress;
    
    // Update dynamic metrics
    this.updateDynamicMetrics();
    
    this.isLoading = false;
  }

  getFilteredTrainings(): TrainingProgress[] {
    switch (this.filter) {
      case 'IN_PROGRESS':
        return this.ongoingTrainings;
      case 'COMPLETED':
        return this.completedTrainings;
      default:
        return this.allTrainings;
    }
  }

  private getTrainingProgress(): TrainingProgress[] {
    // For now, return empty array - in real app this would come from the service
    // We'll create some sample data for demonstration
    return this.getSampleTrainingData();
  }

  private getActualTrainingData(): TrainingProgress[] {
    const trainings: Training[] = JSON.parse(localStorage.getItem('trainings') || '[]');
    
    return trainings.map(training => {
      // Convert status
      let status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED' | 'ON_HOLD' = 'NOT_STARTED';
      if (training.status === 'ONGOING') {
        status = 'IN_PROGRESS';
      } else if (training.status === 'COMPLETED') {
        status = 'COMPLETED';
      } else if (training.status === 'CANCELLED') {
        status = 'ON_HOLD';
      }

      // Convert Training model to TrainingProgress format
      const progress: TrainingProgress = {
        id: training.id,
        clientId: training.clientId,
        trainerId: training.trainerId,
        technology: training.technology,
        totalModules: training.totalMilestones || 0,
        completedModules: training.completedMilestones || 0,
        progressPercentage: training.progressPercentage || 0,
        status: status,
        startDate: new Date(training.startDate),
        estimatedEndDate: training.startDate ? new Date(new Date(training.startDate).setMonth(new Date(training.startDate).getMonth() + 4)) : new Date(),
        milestones: training.milestones ? training.milestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title || '',
          description: milestone.description || '',
          completed: milestone.status === 'COMPLETED',
          dueDate: milestone.dueDate ? new Date(milestone.dueDate) : new Date()
        })) : []
      };

      if (training.status === 'COMPLETED' && training.completedAt) {
        progress.actualEndDate = new Date(training.completedAt);
      }

      return progress;
    });
  }

  private getSampleTrainingData(): TrainingProgress[] {
    return [
      {
        id: 'progress-1',
        clientId: 'client-1',
        trainerId: 'trainer-1',
        technology: 'Angular',
        totalModules: 10,
        completedModules: 7,
        progressPercentage: 70,
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-15'),
        estimatedEndDate: new Date('2024-04-15'),
        milestones: [
          { id: 'm1', title: 'Project Kickoff', description: 'Initial meeting and planning', completed: true, dueDate: new Date('2024-01-15') },
          { id: 'm2', title: 'Requirements Gathering', description: 'Collect and document requirements', completed: true, dueDate: new Date('2024-01-22') },
          { id: 'm3', title: 'Training Module 1', description: 'Complete first training module', completed: true, dueDate: new Date('2024-01-29') },
          { id: 'm4', title: 'Training Module 2', description: 'Complete second training module', completed: true, dueDate: new Date('2024-02-05') },
          { id: 'm5', title: 'Mid-term Evaluation', description: 'Assess progress and gather feedback', completed: true, dueDate: new Date('2024-02-12') },
          { id: 'm6', title: 'Training Module 3', description: 'Complete third training module', completed: true, dueDate: new Date('2024-02-26') },
          { id: 'm7', title: 'Training Module 4', description: 'Complete fourth training module', completed: true, dueDate: new Date('2024-03-11') },
          { id: 'm8', title: 'Final Assessment', description: 'Conduct final evaluation', completed: false, dueDate: new Date('2024-03-25') },
          { id: 'm9', title: 'Project Completion', description: 'Complete all deliverables', completed: false, dueDate: new Date('2024-04-08') },
          { id: 'm10', title: 'Project Handover', description: 'Final handover and documentation', completed: false, dueDate: new Date('2024-04-15') }
        ]
      },
      {
        id: 'progress-2',
        clientId: 'client-2',
        trainerId: 'trainer-2',
        technology: 'React',
        totalModules: 8,
        completedModules: 3,
        progressPercentage: 37.5,
        status: 'IN_PROGRESS',
        startDate: new Date('2024-02-01'),
        estimatedEndDate: new Date('2024-04-01'),
        milestones: [
          { id: 'm1', title: 'Project Kickoff', description: 'Initial meeting and planning', completed: true, dueDate: new Date('2024-02-01') },
          { id: 'm2', title: 'Requirements Gathering', description: 'Collect and document requirements', completed: true, dueDate: new Date('2024-02-08') },
          { id: 'm3', title: 'Training Module 1', description: 'Complete first training module', completed: true, dueDate: new Date('2024-02-15') },
          { id: 'm4', title: 'Training Module 2', description: 'Complete second training module', completed: false, dueDate: new Date('2024-02-22') },
          { id: 'm5', title: 'Mid-term Evaluation', description: 'Assess progress and gather feedback', completed: false, dueDate: new Date('2024-03-01') },
          { id: 'm6', title: 'Training Module 3', description: 'Complete third training module', completed: false, dueDate: new Date('2024-03-15') },
          { id: 'm7', title: 'Final Assessment', description: 'Conduct final evaluation', completed: false, dueDate: new Date('2024-03-22') },
          { id: 'm8', title: 'Project Handover', description: 'Final handover and documentation', completed: false, dueDate: new Date('2024-04-01') }
        ]
      },
      {
        id: 'progress-3',
        clientId: 'client-3',
        trainerId: 'trainer-3',
        technology: 'Node.js',
        totalModules: 12,
        completedModules: 12,
        progressPercentage: 100,
        status: 'COMPLETED',
        startDate: new Date('2023-12-01'),
        estimatedEndDate: new Date('2024-02-01'),
        actualEndDate: new Date('2024-01-28'),
        milestones: [
          { id: 'm1', title: 'Project Kickoff', description: 'Initial meeting and planning', completed: true, dueDate: new Date('2023-12-01') },
          { id: 'm2', title: 'Requirements Gathering', description: 'Collect and document requirements', completed: true, dueDate: new Date('2023-12-08') },
          { id: 'm3', title: 'Training Module 1', description: 'Complete first training module', completed: true, dueDate: new Date('2023-12-15') },
          { id: 'm4', title: 'Training Module 2', description: 'Complete second training module', completed: true, dueDate: new Date('2023-12-22') },
          { id: 'm5', title: 'Mid-term Evaluation', description: 'Assess progress and gather feedback', completed: true, dueDate: new Date('2024-01-01') },
          { id: 'm6', title: 'Training Module 3', description: 'Complete third training module', completed: true, dueDate: new Date('2024-01-08') },
          { id: 'm7', title: 'Training Module 4', description: 'Complete fourth training module', completed: true, dueDate: new Date('2024-01-15') },
          { id: 'm8', title: 'Training Module 5', description: 'Complete fifth training module', completed: true, dueDate: new Date('2024-01-22') }
        ]
      }
    ];
  }

  selectTraining(training: TrainingProgress): void {
    this.selectedTraining = training;
  }

  updateProgress(trainingId: string, completedModules: number): void {
    // In a real app, this would call the business logic service
    const training = this.allTrainings.find((t: TrainingProgress) => t.id === trainingId);
    if (training) {
      training.completedModules = completedModules;
      training.progressPercentage = (completedModules / training.totalModules) * 100;
      
      if (training.progressPercentage === 100) {
        training.status = 'COMPLETED';
        training.actualEndDate = new Date();
      } else if (training.progressPercentage > 0) {
        training.status = 'IN_PROGRESS';
      }
      
      this.loadTrainingProgress(); // Refresh the data
    }
  }

  getClientName(clientId: string): string {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }

  getTrainerName(trainerId: string): string {
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    const trainer = trainers.find((t: any) => t.id === trainerId);
    return trainer ? trainer.name : 'Unknown Trainer';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'IN_PROGRESS': return '#2196F3';
      case 'COMPLETED': return '#4CAF50';
      case 'NOT_STARTED': return '#FF9800';
      case 'ON_HOLD': return '#f44336';
      default: return '#666';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.authService.logout();
  }
}

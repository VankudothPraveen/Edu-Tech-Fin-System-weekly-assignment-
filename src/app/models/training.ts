export type TrainingStatus = 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Milestone {
    id: string;
    trainingId: string;
    title: string;
    description: string;
    month: number; // 1, 2, 3, 4 etc.
    dueDate?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    completedAt?: string;
    completedBy?: 'client' | 'trainer';
}

export interface Training {
    id: string;
    clientId: string;
    trainerId: string;

    // Training details
    technology: string;
    duration: string;
    startDate: string;
    endDate?: string;

    // Milestones
    milestones?: Milestone[];
    totalMilestones?: number;
    completedMilestones?: number;
    progressPercentage?: number;

    status: TrainingStatus;
    createdAt: string;
    completedAt?: string;
    verifiedByClient?: boolean;
    verifiedAt?: string;
}


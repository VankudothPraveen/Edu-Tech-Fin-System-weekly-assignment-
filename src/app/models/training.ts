export type TrainingStatus = 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Training {
    id: string;
    clientId: string;
    trainerId: string;

    // Training details
    technology: string;
    duration: string;
    startDate: string;
    endDate?: string;

    status: TrainingStatus;
    createdAt: string;
    completedAt?: string;
}

export type TrainerStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface Trainer {
    id: string;
    userId: string; // Reference to User
    name: string;
    email: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    experience: string; // e.g., "5 years", "2 years"
    skills: string[]; // Array of technologies
    resumeBase64?: string; // Base64 encoded resume file
    resumeFileName?: string;
    expectedRate: number; // Hourly or daily rate

    status: TrainerStatus;
    createdAt: string;
    approvedAt?: string;
    rejectedAt?: string;
}

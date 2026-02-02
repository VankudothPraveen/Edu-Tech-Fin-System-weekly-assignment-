export type ClientStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface Client {
    id: string;
    userId: string; // Reference to User
    name: string;
    email: string;
    phone: string;
    companyName: string;

    // Training requirement
    technology: string;
    duration: string; // e.g., "3 months", "6 weeks"
    expectedStartDate: string;
    budget?: number;

    status: ClientStatus;
    createdAt: string;
    approvedAt?: string;
    rejectedAt?: string;
}

export type POType = 'CLIENT_PO' | 'TRAINER_PO';
export type POStatus = 'GENERATED' | 'SENT' | 'ACKNOWLEDGED';

export interface PO {
    id: string;
    poNumber: string; // e.g., "PO-2026-001"
    type: POType;

    trainingId?: string;
    clientId?: string; // For CLIENT_PO
    trainerId?: string; // For TRAINER_PO

    amount: number;
    description: string;
    status: POStatus;

    generatedAt: string;
    sentAt?: string;
    acknowledgedAt?: string;
}

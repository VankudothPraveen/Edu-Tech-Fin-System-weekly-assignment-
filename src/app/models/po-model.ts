export type POType = 'CLIENT_PO' | 'TRAINER_PO';
export type POStatus = 'GENERATED' | 'SENT' | 'ACKNOWLEDGED' | 'PROCESSED';

export interface PO {
    id: string;
    poNumber: string; // e.g., "PO-2026-001"
    type: POType;

    trainingId?: string;
    clientId?: string; // For CLIENT_PO
    trainerId?: string; // For TRAINER_PO
    
    clientPOId?: string; // Reference to original client PO (for TRAINER_PO)
    originalAmount?: number; // Original amount from client
    profitMargin?: number; // Admin profit percentage
    adminProfit?: number; // Calculated profit amount

    amount: number;
    description: string;
    status: POStatus;

    generatedAt: string;
    sentAt?: string;
    acknowledgedAt?: string;
    processedAt?: string;
    processedBy?: string; // Admin who processed it
}

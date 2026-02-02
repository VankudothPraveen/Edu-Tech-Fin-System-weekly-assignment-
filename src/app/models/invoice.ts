export type InvoiceType = 'TRAINER_INVOICE' | 'CLIENT_INVOICE';
export type InvoiceStatus = 'SUBMITTED' | 'APPROVED' | 'PAID';

export interface Invoice {
    id: string;
    invoiceNumber: string; // e.g., "INV-2026-001"
    type: InvoiceType;

    trainingId: string;
    trainerId?: string; // For TRAINER_INVOICE
    clientId?: string; // For CLIENT_INVOICE

    // Amounts
    trainerAmount?: number; // What trainer charges
    guviMargin?: number; // GUVI's profit margin (percentage or fixed)
    clientAmount?: number; // What client pays (trainerAmount + margin)

    description: string;
    invoiceFileBase64?: string; // For trainer-uploaded invoices
    invoiceFileName?: string;

    status: InvoiceStatus;

    submittedAt: string;
    approvedAt?: string;
    paidAt?: string;
}

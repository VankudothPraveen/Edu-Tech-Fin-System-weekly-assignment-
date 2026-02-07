import { Injectable } from '@angular/core';
import { Client, ClientStatus } from '../../models/client';
import { Trainer, TrainerStatus } from '../../models/trainer';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  clientId: string;
  amount: number;
  description: string;
  status: 'GENERATED' | 'APPROVED' | 'PAID';
  generatedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  trainerId?: string;
  amount: number;
  description: string;
  status: 'GENERATED' | 'SENT' | 'PAID' | 'OVERDUE';
  generatedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  type: 'CLIENT' | 'TRAINER';
}

export interface TrainingProgress {
  id: string;
  clientId: string;
  trainerId: string;
  technology: string;
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  dueDate: Date;
}

export interface DashboardStats {
  pendingClients: number;
  pendingTrainers: number;
  ongoingTrainings: number;
  completedTrainings: number;
  totalRevenue: number;
  pendingPOs: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageProgress: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessLogicService {
  private readonly STORAGE_KEYS = {
    CLIENTS: 'clients',
    TRAINERS: 'trainers',
    PURCHASE_ORDERS: 'purchase_orders',
    INVOICES: 'invoices',
    TRAINING_PROGRESS: 'training_progress'
  };

  constructor() {}

  // Dashboard Statistics
  getDashboardStats(): DashboardStats {
    const clients = this.getClients();
    const trainers = this.getTrainers();
    const purchaseOrders = this.getPurchaseOrders();
    const invoices = this.getInvoices();
    const progress = this.getTrainingProgress();

    const pendingClients = clients.filter(c => c.status === 'REQUESTED').length;
    const pendingTrainers = trainers.filter(t => t.status === 'PENDING_APPROVAL').length;
    const ongoingTrainings = progress.filter(p => p.status === 'IN_PROGRESS').length;
    const completedTrainings = progress.filter(p => p.status === 'COMPLETED').length;
    const pendingPOs = purchaseOrders.filter(po => po.status === 'GENERATED').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'GENERATED').length;
    const overdueInvoices = invoices.filter(inv => 
      inv.status !== 'PAID' && new Date(inv.dueDate) < new Date()
    ).length;

    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const averageProgress = progress.length > 0 
      ? progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length 
      : 0;

    return {
      pendingClients,
      pendingTrainers,
      ongoingTrainings,
      completedTrainings,
      totalRevenue,
      pendingPOs,
      pendingInvoices,
      overdueInvoices,
      averageProgress
    };
  }

  // Helper method to add timestamps to new entities
  private addTimestamp(entity: any): any {
    if (!entity.createdAt) {
      entity.createdAt = new Date().toISOString();
    }
    return entity;
  }

  // Purchase Order Management
  generatePurchaseOrder(clientId: string): PurchaseOrder {
    const client = this.getClients().find(c => c.id === clientId);
    if (!client) throw new Error('Client not found');

    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${Date.now()}`,
      clientId,
      amount: client.budget || 0,
      description: `Training for ${client.technology} - ${client.duration}`,
      status: 'GENERATED',
      generatedAt: new Date()
    };

    this.savePurchaseOrder(po);
    return po;
  }

  approvePurchaseOrder(poId: string): void {
    const pos = this.getPurchaseOrders();
    const po = pos.find(p => p.id === poId);
    if (po) {
      po.status = 'APPROVED';
      po.approvedAt = new Date();
      this.savePurchaseOrders(pos);
    }
  }

  // Invoice Management
  generateClientInvoice(clientId: string, amount: number, description: string): Invoice {
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      clientId,
      amount,
      description,
      status: 'GENERATED',
      generatedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      type: 'CLIENT'
    };

    this.saveInvoice(invoice);
    return invoice;
  }

  generateTrainerInvoice(trainerId: string, amount: number, description: string): Invoice {
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      clientId: '', // Trainer invoices don't have clientId
      trainerId,
      amount,
      description,
      status: 'GENERATED',
      generatedAt: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      type: 'TRAINER'
    };

    this.saveInvoice(invoice);
    return invoice;
  }

  // Training Progress Management
  createTrainingProgress(clientId: string, trainerId: string, technology: string): TrainingProgress {
    const progress: TrainingProgress = {
      id: `progress-${Date.now()}`,
      clientId,
      trainerId,
      technology,
      totalModules: 10, // Default 10 modules
      completedModules: 0,
      progressPercentage: 0,
      status: 'NOT_STARTED',
      startDate: new Date(),
      estimatedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      milestones: this.generateDefaultMilestones()
    };

    this.saveTrainingProgress(progress);
    return progress;
  }

  updateTrainingProgress(progressId: string, completedModules: number): void {
    const progressList = this.getTrainingProgress();
    const progressIndex = progressList.findIndex(p => p.id === progressId);
    
    if (progressIndex !== -1) {
      const progress = progressList[progressIndex];
      progress.completedModules = Math.min(completedModules, progress.totalModules);
      progress.progressPercentage = (progress.completedModules / progress.totalModules) * 100;
      
      if (progress.progressPercentage === 0) {
        progress.status = 'NOT_STARTED';
      } else if (progress.progressPercentage === 100) {
        progress.status = 'COMPLETED';
        progress.actualEndDate = new Date();
      } else {
        progress.status = 'IN_PROGRESS';
      }

      progressList[progressIndex] = progress;
      localStorage.setItem(this.STORAGE_KEYS.TRAINING_PROGRESS, JSON.stringify(progressList));
    }
  }

  // Excel Export Functions
  exportClientsToExcel(): void {
    const clients = this.getClients();
    this.exportToExcel(clients, 'clients', [
      'name', 'email', 'companyName', 'technology', 'duration', 'status', 'createdAt'
    ]);
  }

  exportTrainersToExcel(): void {
    const trainers = this.getTrainers();
    this.exportToExcel(trainers, 'trainers', [
      'name', 'email', 'age', 'gender', 'experience', 'skills', 'status', 'createdAt'
    ]);
  }

  exportPurchaseOrdersToExcel(): void {
    const pos = this.getPurchaseOrders();
    this.exportToExcel(pos, 'purchase-orders', [
      'poNumber', 'clientId', 'amount', 'description', 'status', 'generatedAt'
    ]);
  }

  exportInvoicesToExcel(): void {
    const invoices = this.getInvoices();
    this.exportToExcel(invoices, 'invoices', [
      'invoiceNumber', 'clientId', 'trainerId', 'amount', 'description', 'status', 'generatedAt', 'dueDate'
    ]);
  }

  exportProgressToExcel(): void {
    const progress = this.getTrainingProgress();
    this.exportToExcel(progress, 'training-progress', [
      'clientId', 'trainerId', 'technology', 'progressPercentage', 'status', 'startDate', 'estimatedEndDate'
    ]);
  }

  // Private Helper Methods
  private getClients(): Client[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CLIENTS) || '[]');
  }

  private getTrainers(): Trainer[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRAINERS) || '[]');
  }

  private getPurchaseOrders(): PurchaseOrder[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PURCHASE_ORDERS) || '[]');
  }

  private getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.INVOICES) || '[]');
  }

  private getTrainingProgress(): TrainingProgress[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRAINING_PROGRESS) || '[]');
  }

  private savePurchaseOrder(po: PurchaseOrder): void {
    const pos = this.getPurchaseOrders();
    pos.push(po);
    localStorage.setItem(this.STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(pos));
  }

  private savePurchaseOrders(pos: PurchaseOrder[]): void {
    localStorage.setItem(this.STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(pos));
  }

  private saveInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    invoices.push(invoice);
    localStorage.setItem(this.STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  private saveTrainingProgress(progress: TrainingProgress): void {
    const progressList = this.getTrainingProgress();
    progressList.push(progress);
    localStorage.setItem(this.STORAGE_KEYS.TRAINING_PROGRESS, JSON.stringify(progressList));
  }

  private generateDefaultMilestones(): Milestone[] {
    return [
      { id: 'm1', title: 'Project Kickoff', description: 'Initial meeting and planning', completed: false, dueDate: new Date() },
      { id: 'm2', title: 'Requirements Gathering', description: 'Collect and document requirements', completed: false, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { id: 'm3', title: 'Training Module 1', description: 'Complete first training module', completed: false, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { id: 'm4', title: 'Training Module 2', description: 'Complete second training module', completed: false, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
      { id: 'm5', title: 'Mid-term Evaluation', description: 'Assess progress and gather feedback', completed: false, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { id: 'm6', title: 'Training Module 3', description: 'Complete third training module', completed: false, dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { id: 'm7', title: 'Training Module 4', description: 'Complete fourth training module', completed: false, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { id: 'm8', title: 'Final Assessment', description: 'Conduct final evaluation', completed: false, dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000) },
      { id: 'm9', title: 'Project Completion', description: 'Complete all deliverables', completed: false, dueDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000) },
      { id: 'm10', title: 'Project Handover', description: 'Final handover and documentation', completed: false, dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
    ];
  }

  private exportToExcel(data: any[], filename: string, columns: string[]): void {
    const csvContent = this.convertToCSV(data, columns);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCSV(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col];
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        if (Array.isArray(value)) {
          return `"${value.join(', ')}"`;
        }
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [header, ...rows].join('\n');
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Client, ClientStatus } from '../../../models/client';

@Component({
    selector: 'app-client-requests',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './client-requests.component.html',
    styleUrl: './client-requests.component.css'
})
export class ClientRequestsComponent implements OnInit {
    clients: Client[] = [];
    filteredClients: Client[] = [];
    filter: 'all' | ClientStatus = 'all';

    ngOnInit(): void {
        this.loadClients();
    }

    loadClients(): void {
        const clientsData = localStorage.getItem('clients');
        this.clients = clientsData ? JSON.parse(clientsData) : [];
        this.applyFilter();
    }

    applyFilter(): void {
        if (this.filter === 'all') {
            this.filteredClients = this.clients;
        } else {
            this.filteredClients = this.clients.filter(c => c.status === this.filter);
        }
    }

    approveClient(client: Client): void {
        client.status = 'APPROVED';
        client.approvedAt = new Date().toISOString();
        this.saveClients();
        alert(`Client "${client.name}" has been approved! They can now generate a PO.`);
    }

    rejectClient(client: Client): void {
        if (confirm(`Are you sure you want to reject ${client.name}'s request?`)) {
            client.status = 'REJECTED';
            client.rejectedAt = new Date().toISOString();
            this.saveClients();
            alert(`Client "${client.name}" has been rejected.`);
        }
    }

    private saveClients(): void {
        localStorage.setItem('clients', JSON.stringify(this.clients));
        this.applyFilter();
    }

    getStatusClass(status: ClientStatus): string {
        return `badge-${(status as string).toLowerCase()}`;
    }

    get requestedCount(): number {
        return this.clients.filter(c => c.status === 'REQUESTED').length;
    }

    get approvedCount(): number {
        return this.clients.filter(c => c.status === 'APPROVED').length;
    }

    get rejectedCount(): number {
        return this.clients.filter(c => c.status === 'REJECTED').length;
    }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toastSubject = new Subject<Toast>();
    public toast$ = this.toastSubject.asObservable();
    private toastId = 0;

    show(message: string, type: ToastType = 'info', duration: number = 3000): void {
        const toast: Toast = {
            id: ++this.toastId,
            type,
            message,
            duration
        };
        this.toastSubject.next(toast);
    }

    success(message: string, duration?: number): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration?: number): void {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }
}

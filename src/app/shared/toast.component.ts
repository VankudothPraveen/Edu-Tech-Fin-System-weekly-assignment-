import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from './notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="toast-container">
            <div *ngFor="let toast of toasts" 
                 class="toast" 
                 [class.toast-success]="toast.type === 'success'"
                 [class.toast-error]="toast.type === 'error'"
                 [class.toast-warning]="toast.type === 'warning'"
                 [class.toast-info]="toast.type === 'info'"
                 [@slideIn]>
                <div class="toast-icon">
                    <span *ngIf="toast.type === 'success'">✓</span>
                    <span *ngIf="toast.type === 'error'">✕</span>
                    <span *ngIf="toast.type === 'warning'">⚠</span>
                    <span *ngIf="toast.type === 'info'">ℹ</span>
                </div>
                <div class="toast-message">{{toast.message}}</div>
                <button class="toast-close" (click)="removeToast(toast.id)">×</button>
            </div>
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 400px;
        }

        .toast {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
            min-width: 300px;
        }

        .toast-success {
            background: rgba(76, 175, 80, 0.9);
            border-left: 4px solid #4CAF50;
        }

        .toast-error {
            background: rgba(244, 67, 54, 0.9);
            border-left: 4px solid #F44336;
        }

        .toast-warning {
            background: rgba(255, 193, 7, 0.9);
            border-left: 4px solid #FFC107;
        }

        .toast-info {
            background: rgba(33, 150, 243, 0.9);
            border-left: 4px solid #2196F3;
        }

        .toast-icon {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
        }

        .toast-message {
            flex: 1;
            color: white;
            font-weight: 500;
        }

        .toast-close {
            background: transparent;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .toast-close:hover {
            opacity: 1;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            .toast-container {
                top: 1rem;
                right: 1rem;
                left: 1rem;
                max-width: none;
            }

            .toast {
                min-width: auto;
            }
        }
    `]
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription?: Subscription;

    constructor(private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.subscription = this.notificationService.toast$.subscribe(toast => {
            this.toasts.push(toast);

            // Auto-remove after duration
            setTimeout(() => {
                this.removeToast(toast.id);
            }, toast.duration || 3000);
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    removeToast(id: number): void {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}

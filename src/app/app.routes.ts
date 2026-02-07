import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/role-selection/role-selection').then(m => m.RoleSelectionComponent)
    },
    {
        path: 'login/:role',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register/:role',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        data: { role: 'admin' },
        children: [
            {
                path: '',
                loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'client-requests',
                loadComponent: () => import('./features/admin/client-requests/client-requests.component').then(m => m.ClientRequestsComponent)
            },
            {
                path: 'trainer-requests',
                loadComponent: () => import('./features/admin/trainer-requests/trainer-requests.component').then(m => m.TrainerRequestsComponent)
            },
            {
                path: 'mapping',
                loadComponent: () => import('./features/admin/mapping/mapping.component').then(m => m.MappingComponent)
            },
            {
                path: 'po-management',
                loadComponent: () => import('./features/admin/po-management/po-management.component').then(m => m.PoManagementComponent)
            },
            {
                path: 'invoice-management',
                loadComponent: () => import('./features/admin/invoice-management/invoice-management.component').then(m => m.InvoiceManagementComponent)
            },
            {
                path: 'progress-tracking',
                loadComponent: () => import('./features/admin/progress-tracking/progress-tracking.component').then(m => m.ProgressTrackingComponent)
            }
        ]
    },
    {
        path: 'trainer',
        canActivate: [authGuard],
        data: { role: 'trainer' },
        children: [
            {
                path: '',
                loadComponent: () => import('./features/trainer/trainer-dashboard/trainer-dashboard.component').then(m => m.TrainerDashboardComponent)
            }
        ]
    },
    {
        path: 'client',
        canActivate: [authGuard],
        data: { role: 'client' },
        children: [
            {
                path: '',
                loadComponent: () => import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];

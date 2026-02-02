import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { UserRole } from '../../../models/user';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    role: UserRole = 'client';
    email = '';
    password = '';
    errorMessage = '';
    isLoading = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.role = params['role'] as UserRole;
        });
    }

    onLogin(): void {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please fill in all fields';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const success = this.authService.login(this.email, this.password, this.role);

        if (success) {
            // Navigate to appropriate dashboard
            this.router.navigate([`/${this.role}`]);
        } else {
            this.errorMessage = 'Invalid credentials. Please try again.';
            this.isLoading = false;
        }
    }

    goToRegister(): void {
        if (this.role !== 'admin') {
            this.router.navigate(['/register', this.role]);
        }
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    get canRegister(): boolean {
        return this.role !== 'admin';
    }

    get roleTitle(): string {
        return this.role.charAt(0).toUpperCase() + this.role.slice(1);
    }
}

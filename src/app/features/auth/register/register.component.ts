import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { UserRole } from '../../../models/user';
import { Client, ClientStatus } from '../../../models/client';
import { Trainer, TrainerStatus } from '../../../models/trainer';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
    role: UserRole = 'client';

    // Common fields
    name = '';
    firstname = '';
    middlename = '';
    surname = '';
    email = '';
    password = '';
    confirmPassword = '';
    address = '';
    agreeToTerms = false;

    // Client-specific fields
    phone = '';
    companyName = '';
    technology = '';
    duration = '';
    expectedStartDate = '';
    budget: number | null = null;

    // Trainer-specific fields
    age: number | null = null;
    gender: 'Male' | 'Female' | 'Other' = 'Male';
    experience = '';
    skills: string[] = [];
    skillInput = '';
    resumeFile: File | null = null;
    resumeFileName = '';
    expectedRate: number | null = null;

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

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.resumeFile = file;
            this.resumeFileName = file.name;
        }
    }

    addSkill(): void {
        if (this.skillInput.trim() && !this.skills.includes(this.skillInput.trim())) {
            this.skills.push(this.skillInput.trim());
            this.skillInput = '';
        }
    }

    removeSkill(skill: string): void {
        this.skills = this.skills.filter(s => s !== skill);
    }

    async onRegister(): Promise<void> {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            // Register user
            const user = this.authService.register({
                email: this.email,
                password: this.password,
                role: this.role,
                name: this.name
            });

            // Create role-specific profile
            if (this.role === 'client') {
                await this.createClientProfile(user.id);
            } else if (this.role === 'trainer') {
                await this.createTrainerProfile(user.id);
            }

            // Navigate to login
            alert('Registration successful! Please login.');
            this.router.navigate(['/login', this.role]);
        } catch (error: any) {
            this.errorMessage = error.message || 'Registration failed. Please try again.';
            this.isLoading = false;
        }
    }

    private async createClientProfile(userId: string): Promise<void> {
        const clientProfile = {
            id: userId,
            userId,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            companyName: this.companyName,
            technology: this.technology,
            duration: this.duration,
            expectedStartDate: this.expectedStartDate,
            budget: this.budget,
            status: 'REQUESTED',
            createdAt: new Date().toISOString()
        };

        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        clients.push(clientProfile);
        localStorage.setItem('clients', JSON.stringify(clients));
    }

    private async createTrainerProfile(userId: string): Promise<void> {
        const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');

        let resumeBase64 = '';
        if (this.resumeFile) {
            resumeBase64 = await this.fileToBase64(this.resumeFile);
        }

        const trainer: Trainer = {
            id: `trainer-${Date.now()}`,
            userId,
            name: this.name,
            email: this.email,
            age: this.age || 0,
            gender: this.gender,
            experience: this.experience,
            skills: this.skills,
            resumeBase64,
            resumeFileName: this.resumeFileName,
            expectedRate: this.expectedRate || 0,
            status: 'PENDING_APPROVAL' as TrainerStatus,
            createdAt: new Date().toISOString()
        };
        trainers.push(trainer);
        localStorage.setItem('trainers', JSON.stringify(trainers));
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    private validateForm(): boolean {
        if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.address) {
            this.errorMessage = 'Please fill in all required fields';
            return false;
        }

        if (!this.agreeToTerms) {
            this.errorMessage = 'Please agree to the terms and conditions';
            return false;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match';
            return false;
        }

        if (this.password.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters';
            return false;
        }

        if (this.role === 'client') {
            if (!this.phone || !this.companyName || !this.technology || !this.duration || !this.expectedStartDate) {
                this.errorMessage = 'Please fill in all client fields';
                return false;
            }
        }

        if (this.role === 'trainer') {
            if (!this.age || !this.experience || this.skills.length === 0 || !this.expectedRate) {
                this.errorMessage = 'Please fill in all trainer fields and add at least one skill';
                return false;
            }
        }

        return true;
    }

    goToLogin(): void {
        this.router.navigate(['/login', this.role]);
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    switchRole(newRole: UserRole): void {
        // This method is kept for completeness but tabs are disabled
        // Users should navigate from the welcome page to select roles
        console.log('Role switching disabled - navigate from welcome page');
    }

    get roleTitle(): string {
        return this.role.charAt(0).toUpperCase() + this.role.slice(1);
    }

    get isClient(): boolean {
        return this.role === 'client';
    }

    get isTrainer(): boolean {
        return this.role === 'trainer';
    }
}

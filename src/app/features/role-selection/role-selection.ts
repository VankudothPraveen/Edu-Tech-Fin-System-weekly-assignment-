import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth-service';
import { UserRole } from '../../models/user';
import { DevDataHelper } from '../../shared/services/dev-data-helper';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.css',
})
export class RoleSelectionComponent {
  activeTab: 'admin' | 'trainer' | 'client' = 'trainer';
  authMode: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';
  
  // Form properties
  email = '';
  password = '';
  // Register form properties
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  confirmPassword = '';
  agreeTerms = false;
  
  // Trainer-specific fields
  trainerAge: number | null = null;
  trainerGender: 'Male' | 'Female' | 'Other' = 'Male';
  trainerExperience = '';
  trainerSkills: string[] = [];
  trainerSkillInput = '';
  trainerExpectedRate: number | null = null;
  
  // Client-specific fields
  clientPhone = '';
  clientCompanyName = '';
  clientTechnology = '';
  clientDuration = '';
  clientExpectedStartDate = '';
  clientBudget: number | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private devDataHelper: DevDataHelper
  ) { }
  
  initTestData(): void {
    if (confirm('This will clear all existing data and create test accounts. Continue?')) {
      this.devDataHelper.initializeTestData();
      alert('Test data initialized! Check console for credentials.\n\nTest Accounts:\nClient: client1@example.com / 123456\nTrainer: john@example.com / 123456\nAdmin: admin@guvi.com / admin123');
    }
  }
  
  showExistingAccounts(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      alert('No accounts exist. Please register or load test data.');
      console.log('No users found in localStorage');
      return;
    }
    
    console.log('=== Existing Accounts ===');
    console.table(users.map((u: any) => ({
      Email: u.email,
      Role: u.role,
      Name: u.name,
      Password: u.password,
      ID: u.id
    })));
    
    const accountList = users.map((u: any) => 
      `${u.role.toUpperCase()}: ${u.email} / ${u.password} (${u.name})`
    ).join('\n');
    
    alert(`Existing Accounts:\n\n${accountList}\n\nUse these exact credentials to login!`);
  }
  
  clearAllData(): void {
    if (confirm('This will DELETE all data including users, trainers, clients, trainings, etc. Continue?')) {
      this.devDataHelper.clearAllData();
      alert('All data cleared! You can now register fresh or load test data.');
      window.location.reload();
    }
  }

  getActiveTabTitle(): string {
    return this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1);
  }

  getTabIndicatorPosition(): number {
    switch(this.activeTab) {
      case 'admin': return 0;
      case 'trainer': return 33.33;
      case 'client': return 66.66;
      default: return 0;
    }
  }

  selectTab(tab: 'admin' | 'trainer' | 'client'): void {
    this.activeTab = tab;
    // Admin can only login, so reset to login mode
    if (tab === 'admin') {
      this.authMode = 'login';
    } else {
      this.authMode = 'login';
    }
    this.resetForms();
  }

  setAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.resetForms();
  }

  resetForms(): void {
    this.email = '';
    this.password = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.confirmPassword = '';
    this.agreeTerms = false;
    this.errorMessage = '';
    this.isLoading = false;
    
    // Reset trainer fields
    this.trainerAge = null;
    this.trainerGender = 'Male';
    this.trainerExperience = '';
    this.trainerSkills = [];
    this.trainerSkillInput = '';
    this.trainerExpectedRate = null;
    
    // Reset client fields
    this.clientPhone = '';
    this.clientCompanyName = '';
    this.clientTechnology = '';
    this.clientDuration = '';
    this.clientExpectedStartDate = '';
    this.clientBudget = null;
  }
  
  addSkill(): void {
    if (this.trainerSkillInput.trim() && !this.trainerSkills.includes(this.trainerSkillInput.trim())) {
      this.trainerSkills.push(this.trainerSkillInput.trim());
      this.trainerSkillInput = '';
    }
  }
  
  removeSkill(skill: string): void {
    this.trainerSkills = this.trainerSkills.filter(s => s !== skill);
  }

  onLogin(): void {
    console.log('Login attempt:', { email: this.email, password: this.password, role: this.activeTab });
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Use setTimeout to ensure the UI updates before login processing
    setTimeout(() => {
      const success = this.authService.login(this.email, this.password, this.activeTab as UserRole);
      console.log('Login success:', success);

      if (success) {
        console.log('Navigating to:', `/${this.activeTab}`);
        // Navigate to appropriate dashboard
        this.router.navigate([`/${this.activeTab}`]).then(() => {
          console.log('Navigation completed successfully');
        }).catch(err => {
          console.error('Navigation error:', err);
          this.errorMessage = 'Navigation failed. Please try again.';
          this.isLoading = false;
        });
      } else {
        this.errorMessage = `Invalid credentials for ${this.activeTab}. Please check your email and password.`;
        this.isLoading = false;
      }
    }, 100);
  }

  async onRegister(): Promise<void> {
    console.log('=== Registration started ===');
    console.log('Role:', this.activeTab);
    console.log('Name:', this.registerName);
    console.log('Email:', this.registerEmail);
    
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.registerPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'Please agree to the Terms and Conditions';
      return;
    }
    
    // Validate trainer-specific fields
    if (this.activeTab === 'trainer') {
      if (!this.trainerAge || !this.trainerExperience || !this.trainerExpectedRate || this.trainerSkills.length === 0) {
        this.errorMessage = 'Please fill in all trainer details (age, experience, rate, and at least one skill)';
        return;
      }
    }
    
    // Validate client-specific fields
    if (this.activeTab === 'client') {
      if (!this.clientPhone || !this.clientCompanyName || !this.clientTechnology || 
          !this.clientDuration || !this.clientExpectedStartDate) {
        this.errorMessage = 'Please fill in all client details (phone, company, technology, duration, start date)';
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Register user
      console.log('Creating user account...');
      const newUser = this.authService.register({
        name: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword,
        role: this.activeTab as UserRole
      });
      console.log('User created:', newUser);

      // Create role-specific profile
      if (this.activeTab === 'client') {
        console.log('Creating client profile...');
        this.createClientProfile(newUser.id);
      } else if (this.activeTab === 'trainer') {
        console.log('Creating trainer profile...');
        this.createTrainerProfile(newUser.id);
      }

      // Show success message
      alert(`Registration successful! Welcome ${this.registerName}. You can now login.`);
      
      // Auto-login after successful registration
      console.log('Attempting auto-login...');
      const loginSuccess = this.authService.login(this.registerEmail, this.registerPassword, this.activeTab as UserRole);
      console.log('Auto-login success:', loginSuccess);
      
      if (loginSuccess) {
        // Navigate to appropriate dashboard
        console.log('Navigating to dashboard:', `/${this.activeTab}`);
        this.router.navigate([`/${this.activeTab}`]);
      } else {
        // If auto-login fails, switch to login mode
        this.authMode = 'login';
        this.isLoading = false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage = error.message || 'Registration failed. Email might already exist.';
      this.isLoading = false;
    }
  }

  private createClientProfile(userId: string): void {
    console.log('Creating client profile for userId:', userId);
    
    const clientProfile = {
      id: userId,
      userId,
      name: this.registerName,
      email: this.registerEmail,
      phone: this.clientPhone,
      companyName: this.clientCompanyName,
      technology: this.clientTechnology,
      duration: this.clientDuration,
      expectedStartDate: this.clientExpectedStartDate,
      budget: this.clientBudget,
      status: 'REQUESTED' as 'REQUESTED' | 'APPROVED' | 'REJECTED',
      createdAt: new Date().toISOString()
    };

    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    console.log('Existing clients:', clients);
    
    clients.push(clientProfile);
    localStorage.setItem('clients', JSON.stringify(clients));
    
    console.log('Client profile saved. Total clients now:', clients.length);
    console.log('Updated clients array:', clients);
    
    // Verify the data was saved
    const verifyClients = JSON.parse(localStorage.getItem('clients') || '[]');
    console.log('Verification - clients in localStorage:', verifyClients);
  }

  private createTrainerProfile(userId: string): void {
    console.log('Creating trainer profile for userId:', userId);
    
    const trainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    console.log('Existing trainers:', trainers);

    const trainer = {
      id: `trainer-${Date.now()}`,
      userId,
      name: this.registerName,
      email: this.registerEmail,
      age: this.trainerAge || 0,
      gender: this.trainerGender as 'Male' | 'Female' | 'Other',
      experience: this.trainerExperience,
      skills: [...this.trainerSkills],
      resumeBase64: '',
      resumeFileName: '',
      expectedRate: this.trainerExpectedRate || 0,
      status: 'PENDING_APPROVAL' as 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED',
      createdAt: new Date().toISOString()
    };
    
    trainers.push(trainer);
    localStorage.setItem('trainers', JSON.stringify(trainers));
    
    console.log('Trainer profile saved. Total trainers now:', trainers.length);
    console.log('Updated trainers array:', trainers);
    
    // Verify the data was saved
    const verifyTrainers = JSON.parse(localStorage.getItem('trainers') || '[]');
    console.log('Verification - trainers in localStorage:', verifyTrainers);
  }
}

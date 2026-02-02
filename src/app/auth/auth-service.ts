import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserSignal.set(user);
    }
  }

  login(email: string, password: string, role: UserRole): boolean {
    // Get users from localStorage
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check for admin (hardcoded credentials)
    if (role === 'admin' && email === 'admin@guvi.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-001',
        email: 'admin@guvi.com',
        password: 'admin123',
        role: 'admin',
        name: 'GUVI Admin',
        createdAt: new Date().toISOString()
      };
      this.currentUserSignal.set(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    // Check for trainer/client in users array
    const user = users.find(u =>
      u.email === email &&
      u.password === password &&
      u.role === role
    );

    if (user) {
      this.currentUserSignal.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }

    return false;
  }

  register(userData: Omit<User, 'id' | 'createdAt'>): User {
    // Get existing users
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    // Save to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return newUser;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUser();
    return user !== null && user.role === role;
  }

  getUserId(): string | null {
    return this.currentUser()?.id || null;
  }

  getUserRole(): UserRole | null {
    return this.currentUser()?.role || null;
  }
}

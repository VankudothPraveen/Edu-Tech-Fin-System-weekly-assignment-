import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user';

interface Notification {
  id: string;
  recipientId: string;
  recipientRole: 'trainer' | 'client' | 'admin';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

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
    console.log('AuthService.login called:', { email, role });
    
    // Get users from localStorage
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    console.log('Existing users:', users);

    // Check for admin (hardcoded credentials)
    if (role === 'admin' && email === 'admin@guvi.com' && password === 'admin123') {
      console.log('Admin login successful');
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
    console.log('Found user:', user);

    if (user) {
      console.log('User login successful');
      this.currentUserSignal.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }

    // Debug: Check if user exists with wrong password or role
    const userByEmail = users.find(u => u.email === email);
    if (userByEmail) {
      console.log('User exists but credentials mismatch!');
      console.log('Expected role:', role, '| User role:', userByEmail.role);
      console.log('Password match:', userByEmail.password === password);
    } else {
      console.log('No user found with email:', email);
      console.log('Available users:', users.map(u => ({ email: u.email, role: u.role })));
    }

    console.log('Login failed');
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

    // Create notification for user creation
    this.createNotification({
      recipientId: userData.email,
      recipientRole: userData.role as 'trainer' | 'client' | 'admin',
      message: `Welcome to Tech Financial System! Your ${userData.role} account has been created successfully.`,
      type: 'success',
      timestamp: new Date(),
      read: false
    });

    // If trainer is registering, create notification for admin
    if (userData.role === 'trainer') {
      this.createNotification({
        recipientId: 'admin-001',
        recipientRole: 'admin',
        message: `New trainer registered: ${userData.name} (${userData.email})`,
        type: 'info',
        timestamp: new Date(),
        read: false
      });
    }

    return newUser;
  }

  createClientAccountForTrainer(clientData: Omit<User, 'id' | 'createdAt'>, trainerId: string): User {
    // Get existing users
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check if email already exists
    if (users.some(u => u.email === clientData.email)) {
      throw new Error('Email already registered');
    }

    // Create new client user
    const newClient: User = {
      ...clientData,
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    // Save to users array
    users.push(newClient);
    localStorage.setItem('users', JSON.stringify(users));

    // Create notification for client
    this.createNotification({
      recipientId: newClient.id,
      recipientRole: 'client',
      message: `Your account has been created by trainer. Welcome to Tech Financial System!`,
      type: 'success',
      timestamp: new Date(),
      read: false
    });

    // Create notification for trainer
    this.createNotification({
      recipientId: trainerId,
      recipientRole: 'trainer',
      message: `Client account created successfully: ${newClient.name} (${newClient.email})`,
      type: 'success',
      timestamp: new Date(),
      read: false
    });

    // Create notification for admin
    this.createNotification({
      recipientId: 'admin-001',
      recipientRole: 'admin',
      message: `New client account created by trainer: ${newClient.name} (${newClient.email})`,
      type: 'info',
      timestamp: new Date(),
      read: false
    });

    return newClient;
  }

  createNotification(notification: Omit<Notification, 'id'>): void {
    // Get existing notifications
    const notificationsJson = localStorage.getItem('notifications');
    const notifications: Notification[] = notificationsJson ? JSON.parse(notificationsJson) : [];

    // Add new notification
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false
    };

    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  getNotificationsForUser(userId: string): Notification[] {
    const notificationsJson = localStorage.getItem('notifications');
    const notifications: Notification[] = notificationsJson ? JSON.parse(notificationsJson) : [];
    return notifications.filter(n => n.recipientId === userId && !n.read);
  }

  markNotificationAsRead(notificationId: string): void {
    const notificationsJson = localStorage.getItem('notifications');
    const notifications: Notification[] = notificationsJson ? JSON.parse(notificationsJson) : [];

    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
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
    const user = this.currentUser();
    return user ? user.id : null;
  }

  getUserRole(): UserRole | null {
    return this.currentUser()?.role || null;
  }
}

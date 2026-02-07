import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DevDataHelper {
  
  initializeTestData(): void {
    console.log('🔧 Initializing test data...');
    
    // Create users
    const users = [
      {
        id: 'admin-001',
        email: 'admin@guvi.com',
        password: 'admin123',
        role: 'admin',
        name: 'GUVI Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-trainer-1',
        email: 'john@example.com',
        password: '123456',
        role: 'trainer',
        name: 'John Smith',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-trainer-2',
        email: 'sarah@example.com',
        password: '123456',
        role: 'trainer',
        name: 'Sarah Johnson',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-client-1',
        email: 'client1@example.com',
        password: '123456',
        role: 'client',
        name: 'ABC Corporation',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-client-2',
        email: 'client2@example.com',
        password: '123456',
        role: 'client',
        name: 'XYZ Tech Inc',
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ Users created:', users.length);
    
    // Create trainers
    const trainers = [
      {
        id: 'trainer-1',
        userId: 'user-trainer-1',
        name: 'John Smith',
        email: 'john@example.com',
        age: 32,
        gender: 'Male',
        experience: '5 years',
        skills: ['JavaScript', 'React', 'Angular', 'Node.js', 'TypeScript'],
        resumeBase64: '',
        resumeFileName: '',
        expectedRate: 50,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'trainer-2',
        userId: 'user-trainer-2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        age: 28,
        gender: 'Female',
        experience: '4 years',
        skills: ['Python', 'Django', 'Machine Learning', 'Data Science', 'SQL'],
        resumeBase64: '',
        resumeFileName: '',
        expectedRate: 45,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    localStorage.setItem('trainers', JSON.stringify(trainers));
    console.log('✅ Trainers created:', trainers.length);
    
    // Create clients
    const clients = [
      {
        id: 'client-1',
        userId: 'user-client-1',
        name: 'ABC Corporation',
        email: 'client1@example.com',
        phone: '123-456-7890',
        companyName: 'ABC Corp',
        technology: 'React',
        duration: '3 months',
        expectedStartDate: '2026-02-15',
        budget: 15000,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'client-2',
        userId: 'user-client-2',
        name: 'XYZ Tech Inc',
        email: 'client2@example.com',
        phone: '987-654-3210',
        companyName: 'XYZ Tech',
        technology: 'Python',
        duration: '2 months',
        expectedStartDate: '2026-03-01',
        budget: 12000,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    localStorage.setItem('clients', JSON.stringify(clients));
    console.log('✅ Clients created:', clients.length);
    
    // Create sample training assignments
    const trainings = [
      {
        id: 'training-1',
        clientId: 'client-1',
        trainerId: 'trainer-1',
        technology: 'React',
        duration: '3 months',
        startDate: '2026-02-15',
        status: 'ONGOING',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    localStorage.setItem('trainings', JSON.stringify(trainings));
    console.log('✅ Training assignments created:', trainings.length);
    
    // Initialize empty arrays for other entities
    localStorage.setItem('pos', JSON.stringify([]));
    localStorage.setItem('invoices', JSON.stringify([]));
    localStorage.setItem('notifications', JSON.stringify([]));
    
    console.log('🎉 Test data initialization complete!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@guvi.com / admin123');
    console.log('Trainer 1: john@example.com / 123456');
    console.log('Trainer 2: sarah@example.com / 123456');
    console.log('Client 1: client1@example.com / 123456');
    console.log('Client 2: client2@example.com / 123456');
  }
  
  clearAllData(): void {
    localStorage.clear();
    console.log('🗑️ All data cleared!');
  }
  
  showCurrentData(): void {
    console.log('📊 Current Data Summary:');
    console.log('Users:', JSON.parse(localStorage.getItem('users') || '[]').length);
    console.log('Trainers:', JSON.parse(localStorage.getItem('trainers') || '[]').length);
    console.log('Clients:', JSON.parse(localStorage.getItem('clients') || '[]').length);
    console.log('Trainings:', JSON.parse(localStorage.getItem('trainings') || '[]').length);
    console.log('POs:', JSON.parse(localStorage.getItem('pos') || '[]').length);
    console.log('Invoices:', JSON.parse(localStorage.getItem('invoices') || '[]').length);
  }
}

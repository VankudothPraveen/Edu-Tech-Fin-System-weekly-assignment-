export type UserRole = 'admin' | 'trainer' | 'client';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: string;
}

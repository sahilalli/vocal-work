export enum Role {
  ADMIN = 'ADMIN',
  CANDIDATE = 'CANDIDATE'
}

export enum JobStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  walletBalance: number;
  offerLetter?: string; // Markdown content
  isOfferAccepted?: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string; // The prompt for the audio
  script: string; // The actual text to read
  reward: number;
  status: JobStatus;
  assignedTo?: string; // User ID
  completedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
}

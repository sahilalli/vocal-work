import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Job, Transaction, Role, JobStatus } from './types';

interface AppState {
  currentUser: User | null;
  users: User[];
  jobs: Job[];
  transactions: Transaction[];
  login: (username: string) => void;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addJob: (job: Job) => void;
  takeJob: (jobId: string, userId: string) => void;
  completeJob: (jobId: string) => void;
  acceptOffer: (userId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Admin User', role: Role.ADMIN, walletBalance: 0 },
  { id: '2', username: 'john', name: 'John Doe', role: Role.CANDIDATE, walletBalance: 150, offerLetter: '# Offer Letter\n\nWelcome to the team!', isOfferAccepted: false },
  { id: '3', username: 'jane', name: 'Jane Smith', role: Role.CANDIDATE, walletBalance: 450, isOfferAccepted: true }
];

const MOCK_JOBS: Job[] = [
  { id: '101', title: 'Intro Greeting', description: 'Upbeat and friendly', script: 'Welcome to VocalWork! We are happy to have you.', reward: 15, status: JobStatus.OPEN },
  { id: '102', title: 'Tech Narration', description: 'Serious and slow', script: 'The quantum processor utilizes entanglement to solve complex problems.', reward: 25, status: JobStatus.OPEN },
  { id: '103', title: 'Podcast Outro', description: 'Relaxed', script: 'Thanks for listening. See you next time.', reward: 10, status: JobStatus.COMPLETED, assignedTo: '2', completedAt: '2023-10-01' }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', userId: '2', amount: 10, description: 'Completed: Podcast Outro', date: '2023-10-01' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const login = (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const addUser = (user: User) => setUsers([...users, user]);
  
  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const addJob = (job: Job) => setJobs([...jobs, job]);

  const takeJob = (jobId: string, userId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: JobStatus.ASSIGNED, assignedTo: userId } : j));
  };

  const completeJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !currentUser) return;

    // Update Job
    const updatedJob = { ...job, status: JobStatus.COMPLETED, completedAt: new Date().toISOString() };
    setJobs(jobs.map(j => j.id === jobId ? updatedJob : j));

    // Pay User
    const newBalance = currentUser.walletBalance + job.reward;
    updateUser(currentUser.id, { walletBalance: newBalance });

    // Add Transaction
    const newTx: Transaction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      amount: job.reward,
      description: `Completed: ${job.title}`,
      date: new Date().toLocaleDateString()
    };
    setTransactions([...transactions, newTx]);
  };

  const acceptOffer = (userId: string) => {
    updateUser(userId, { isOfferAccepted: true });
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, jobs, transactions, 
      login, logout, addUser, updateUser, deleteUser, 
      addJob, takeJob, completeJob, acceptOffer 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};

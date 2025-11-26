import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Badge } from '../components/UI';
import { JobStatus } from '../types';
import { AudioRecorder } from '../components/AudioRecorder';
import { DollarSign, Briefcase, FileText, CheckCircle, Mic } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CandidateDashboard: React.FC = () => {
  const { currentUser, jobs, takeJob } = useStore();
  const availableJobs = jobs.filter(j => j.status === JobStatus.OPEN);
  const myEarnings = currentUser?.walletBalance || 0;
  const completedCount = jobs.filter(j => j.assignedTo === currentUser?.id && j.status === JobStatus.COMPLETED).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Wallet Balance</p>
              <h2 className="text-3xl font-bold mt-1">${myEarnings.toFixed(2)}</h2>
            </div>
            <DollarSign className="w-10 h-10 text-indigo-200 opacity-50" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
             <div>
              <p className="text-gray-500 text-sm font-medium">Completed Jobs</p>
              <h2 className="text-3xl font-bold mt-1 text-gray-900">{completedCount}</h2>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>
        <Card>
           <div className="flex items-center justify-between">
             <div>
              <p className="text-gray-500 text-sm font-medium">Available Tasks</p>
              <h2 className="text-3xl font-bold mt-1 text-gray-900">{availableJobs.length}</h2>
            </div>
            <Briefcase className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      <h3 className="text-xl font-semibold text-gray-800">New Opportunities</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableJobs.map(job => (
          <Card key={job.id} className="hover:shadow-md transition-shadow" 
            title={job.title}
            action={<Badge status="OPEN" />}
          >
            <p className="text-gray-600 mb-4 text-sm h-10 line-clamp-2">{job.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-bold text-green-600">${job.reward}</span>
              <Button onClick={() => currentUser && takeJob(job.id, currentUser.id)} variant="secondary" className="text-sm">
                Take Job
              </Button>
            </div>
          </Card>
        ))}
        {availableJobs.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">No new jobs available at the moment.</div>
        )}
      </div>
    </div>
  );
};

export const CandidateOfferLetter: React.FC = () => {
  const { currentUser, acceptOffer } = useStore();

  if (!currentUser?.offerLetter) return <div className="p-8 text-center text-gray-500">No offer letter received yet.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <div className="prose prose-indigo max-w-none mb-8">
          {currentUser.offerLetter.split('\n').map((line, i) => (
             <p key={i} className={line.startsWith('#') ? 'text-2xl font-bold text-gray-900 mb-4' : 'text-gray-700 mb-2'}>
               {line.replace('#', '')}
             </p>
          ))}
        </div>
        
        {!currentUser.isOfferAccepted ? (
          <div className="border-t pt-6 flex justify-end space-x-4">
            <Button onClick={() => acceptOffer(currentUser.id)} variant="success" className="w-full sm:w-auto">
              Accept Offer & Start Working
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium border border-green-200">
            You have accepted this offer.
          </div>
        )}
      </Card>
    </div>
  );
};

export const CandidateActiveJobs: React.FC = () => {
  const { jobs, currentUser, completeJob } = useStore();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const myJobs = jobs.filter(j => j.assignedTo === currentUser?.id && j.status === JobStatus.ASSIGNED);

  const handleStart = (id: string) => setActiveJobId(id);
  const handleFinish = () => {
    if (activeJobId) {
      completeJob(activeJobId);
      setActiveJobId(null);
    }
  };

  if (activeJobId) {
    const job = jobs.find(j => j.id === activeJobId);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="secondary" onClick={() => setActiveJobId(null)}>← Back to List</Button>
        </div>
        <Card title={`Recording: ${job?.title}`}>
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
            <strong>Instruction:</strong> {job?.description}
          </div>
          {job && <AudioRecorder script={job.script} onComplete={handleFinish} />}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Active Jobs</h2>
      {myJobs.length === 0 && <div className="text-gray-500">You haven't taken any jobs yet. Check the "Offers List".</div>}
      
      <div className="grid gap-4">
        {myJobs.map(job => (
          <Card key={job.id} className="flex flex-row items-center justify-between p-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              <p className="text-gray-500 text-sm mt-1">Reward: <span className="text-green-600 font-bold">${job.reward}</span></p>
            </div>
            <Button onClick={() => handleStart(job.id)}>
              <Mic className="w-4 h-4 mr-2" /> Start Recording
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const CandidateWallet: React.FC = () => {
  const { transactions, currentUser } = useStore();
  const myTx = transactions.filter(t => t.userId === currentUser?.id);

  // Prepare data for chart
  const data = myTx.map(t => ({ name: t.date.split('/')[0] + '/' + t.date.split('/')[1], amount: t.amount }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Earnings History" className="lg:col-span-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Current Balance">
          <div className="text-center py-10">
            <span className="text-5xl font-bold text-gray-900">${currentUser?.walletBalance}</span>
            <p className="text-gray-500 mt-2">Available for withdrawal</p>
            <Button className="mt-6 w-full">Withdraw Funds</Button>
          </div>
        </Card>
      </div>

      <Card title="Transaction History">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myTx.map(tx => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">+${tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {myTx.length === 0 && <div className="p-6 text-center text-gray-500">No transactions yet.</div>}
        </div>
      </Card>
    </div>
  );
};
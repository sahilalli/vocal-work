import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Badge } from '../components/UI';
import { Role, User, Job, JobStatus } from '../types';
import { generateOfferLetter, generateScript } from '../services/gemini';
import { Trash2, Plus, Wand2, FileText, Users as UsersIcon } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, jobs } = useStore();
  const totalPaid = users.reduce((acc, u) => acc + u.walletBalance, 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gray-900 text-white border-none">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Total Candidates</p>
            <h2 className="text-3xl font-bold mt-1">{users.filter(u => u.role === Role.CANDIDATE).length}</h2>
          </div>
          <UsersIcon className="w-8 h-8 text-gray-600" />
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Active Jobs</p>
            <h2 className="text-3xl font-bold mt-1 text-gray-900">{jobs.filter(j => j.status === JobStatus.OPEN || j.status === JobStatus.ASSIGNED).length}</h2>
          </div>
           <FileText className="w-8 h-8 text-blue-200" />
        </div>
      </Card>
      <Card>
        <div>
          <p className="text-gray-500 text-sm">Total Payouts (Mock)</p>
          <h2 className="text-3xl font-bold mt-1 text-green-600">${totalPaid}</h2>
        </div>
      </Card>
    </div>
  );
};

export const AdminUsers: React.FC = () => {
  const { users, addUser, deleteUser, updateUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState(''); // Used as username for simplicity
  const [loadingOffer, setLoadingOffer] = useState<string | null>(null);

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail) return;
    const newUser: User = {
      id: Date.now().toString(),
      username: newUserEmail.split('@')[0],
      name: newUserName,
      role: Role.CANDIDATE,
      walletBalance: 0,
      isOfferAccepted: false
    };
    addUser(newUser);
    setIsModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleGenerateOffer = async (user: User) => {
    setLoadingOffer(user.id);
    const letter = await generateOfferLetter(user.name, "Voice Artist");
    updateUser(user.id, { offerLetter: letter });
    setLoadingOffer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Manage Candidates</h2>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Candidate</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" title="Add New Candidate">
            <Input label="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
            <Input label="Email/Username" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Create User</Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offer Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.filter(u => u.role === Role.CANDIDATE).map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   {user.isOfferAccepted ? (
                     <Badge status="COMPLETED" /> 
                   ) : user.offerLetter ? (
                     <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">Pending Acceptance</span>
                   ) : (
                     <Button 
                        variant="secondary" 
                        className="text-xs h-7" 
                        onClick={() => handleGenerateOffer(user)}
                        isLoading={loadingOffer === user.id}
                      >
                        <Wand2 className="w-3 h-3 mr-1" /> Create Offer
                     </Button>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export const AdminJobs: React.FC = () => {
  const { jobs, addJob } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('');
  const [generatedData, setGeneratedData] = useState<{ description: string, script: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScript = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const result = await generateScript(topic);
    setGeneratedData(result);
    setIsGenerating(false);
  };

  const handleSaveJob = () => {
    if (!title || !reward || !generatedData) return;
    const newJob: Job = {
      id: Date.now().toString(),
      title,
      description: generatedData.description,
      script: generatedData.script,
      reward: parseFloat(reward),
      status: JobStatus.OPEN
    };
    addJob(newJob);
    setIsModalOpen(false);
    // Reset
    setTitle('');
    setTopic('');
    setReward('');
    setGeneratedData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Job Management</h2>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create New Job</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" title="Create Audio Job">
            <div className="space-y-4">
               <Input label="Job Title" placeholder="e.g. Friendly Voicemail" value={title} onChange={e => setTitle(e.target.value)} />
               <Input label="Reward ($)" type="number" value={reward} onChange={e => setReward(e.target.value)} />
               
               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3">
                 <label className="block text-sm font-medium text-indigo-900">AI Script Generator</label>
                 <div className="flex gap-2">
                   <input 
                    className="flex-1 px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Enter a topic (e.g., 'Sale announcement for a shoe store')"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                   />
                   <Button onClick={handleGenerateScript} isLoading={isGenerating} className="whitespace-nowrap">
                     <Wand2 className="w-4 h-4 mr-2" /> Generate
                   </Button>
                 </div>
               </div>

               {generatedData && (
                 <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instruction</label>
                      <textarea 
                        className="w-full p-2 border rounded text-sm" 
                        rows={2}
                        value={generatedData.description}
                        onChange={e => setGeneratedData({...generatedData, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Script to Read</label>
                      <textarea 
                        className="w-full p-2 border rounded text-sm font-mono bg-gray-50" 
                        rows={4}
                        value={generatedData.script}
                        onChange={e => setGeneratedData({...generatedData, script: e.target.value})}
                      />
                    </div>
                 </div>
               )}
            </div>
            <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveJob} disabled={!generatedData}>Publish Job</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-4">
        {jobs.map(job => (
          <Card key={job.id} className="flex flex-col md:flex-row md:items-center justify-between p-5">
            <div className="flex-1 min-w-0 mr-4">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                 <Badge status={job.status} />
               </div>
               <p className="text-sm text-gray-500 truncate">{job.description}</p>
               <p className="text-xs text-gray-400 font-mono mt-1 truncate">"{job.script}"</p>
            </div>
            <div className="mt-4 md:mt-0 text-right min-w-[100px]">
              <div className="text-xl font-bold text-green-600">${job.reward}</div>
              <div className="text-xs text-gray-400">Reward</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

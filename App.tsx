import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useStore } from './store';
import { Role } from './types';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  CheckSquare, 
  Wallet, 
  LogOut, 
  Settings, 
  Users, 
  Mic2 
} from 'lucide-react';

// Pages
import { CandidateDashboard, CandidateOfferLetter, CandidateActiveJobs, CandidateWallet } from './pages/CandidateViews';
import { AdminDashboard, AdminUsers, AdminJobs } from './pages/AdminViews';
import { Input, Button, Card } from './components/UI';

const Login: React.FC = () => {
  const { login } = useStore();
  const [username, setUsername] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <Mic2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VocalWork Agency</h1>
          <p className="text-gray-500">Sign in to your dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Username" 
            placeholder="Enter 'admin' or 'john'" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400 bg-gray-50 p-4 rounded-lg">
          <p>Demo Credentials:</p>
          <p>Admin: <strong>admin</strong></p>
          <p>Candidate: <strong>john</strong></p>
        </div>
      </Card>
    </div>
  );
};

const SidebarItem: React.FC<{ to: string, icon: React.ElementType, label: string }> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useStore();

  if (!currentUser) return <Navigate to="/login" />;

  const isCandidate = currentUser.role === Role.CANDIDATE;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
             <Mic2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-wide">VocalWork</span>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          {isCandidate ? (
            <>
              <SidebarItem to="/candidate/offer" icon={FileText} label="Offer Letter" />
              <SidebarItem to="/candidate/dashboard" icon={LayoutDashboard} label="Dashboard & Offers" />
              <SidebarItem to="/candidate/my-jobs" icon={Mic2} label="My Active Jobs" />
              <SidebarItem to="/candidate/wallet" icon={Wallet} label="My Wallet" />
            </>
          ) : (
            <>
              <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/admin/users" icon={Users} label="Manage Users" />
              <SidebarItem to="/admin/jobs" icon={Briefcase} label="Manage Jobs" />
            </>
          )}
          <SidebarItem to="/profile" icon={Settings} label="Update Profile" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={logout} className="w-full justify-start text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-none">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
           {children}
        </div>
      </main>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const [password, setPassword] = useState('');
  
  return (
    <div className="max-w-md mx-auto">
      <Card title="Update Profile">
         <div className="space-y-4">
            <Input label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button className="w-full" onClick={() => { setPassword(''); alert('Password updated!'); }}>Update Password</Button>
         </div>
      </Card>
    </div>
  )
}

const MainRouter: React.FC = () => {
  const { currentUser } = useStore();
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === Role.ADMIN ? "/admin/dashboard" : "/candidate/dashboard"} />} />
        
        <Route path="/candidate/*" element={
          <Layout>
            <Routes>
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="offer" element={<CandidateOfferLetter />} />
              <Route path="my-jobs" element={<CandidateActiveJobs />} />
              <Route path="wallet" element={<CandidateWallet />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </Layout>
        } />

        <Route path="/admin/*" element={
          <Layout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </Layout>
        } />
        
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
};

export default App;

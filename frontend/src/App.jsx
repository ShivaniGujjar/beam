import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import DeploymentPanel from './components/DeploymentPanel';
import History from './components/History';

const socket = io('http://localhost:9000');

function App() {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APP STATE ---
  const [repoUrl, setRepoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [logs, setLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLink, setDeployLink] = useState('');
  const [currentStep, setCurrentStep] = useState(0); 
  const [history, setHistory] = useState([]); 
  const logEndRef = useRef(null);

  const steps = [
    { id: 1, label: 'Cloning' },
    { id: 2, label: 'Building' },
    { id: 3, label: 'Beaming' },
    { id: 4, label: 'Live' }
  ];

  // --- AUTH LOGIC (The Missing Functions) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/login' : '/signup';
    try {
      const res = await axios.post(`http://localhost:9000${endpoint}`, { email, password });
      if (authMode === 'login') {
        localStorage.setItem('token', res.data.token);
        setIsAuthenticated(true);
      } else {
        setAuthMode('login');
        alert("Signup successful! Please login.");
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  // --- DEPLOYMENT LOGIC ---
  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:9000/deployments', {
        headers: { Authorization: token }
      });
      setHistory(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [deployLink, isAuthenticated]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const lastLog = logs[logs.length - 1];
    if (lastLog) {
      if (lastLog.includes('Cloning')) setCurrentStep(1);
      if (lastLog.includes('Installing') || lastLog.includes('build')) setCurrentStep(2);
      if (lastLog.includes('Beaming')) setCurrentStep(3);
      if (lastLog.includes('DEPLOYMENT COMPLETE')) {
        setCurrentStep(4);
        setIsDeploying(false);
        const slug = projectName.toLowerCase().replace(/ /g, '-');
        setDeployLink(`http://localhost:8000/${slug}.beam`);
      }
    }
  }, [logs, projectName]);

  useEffect(() => {
    socket.on('message', (log) => setLogs((prev) => [...prev, log]));
    return () => socket.off('message');
  }, []);

  const handleDeploy = async () => {
  if (!repoUrl || !projectName) return;
  const token = localStorage.getItem('token');
  
  setIsDeploying(true);
  setLogs([]);
  setCurrentStep(1);
  setDeployLink('');

  try {
    const res = await axios.post('http://localhost:9000/project', 
      { gitUrl: repoUrl, projectName },
      { headers: { Authorization: token } }
    );
    
    // Check if response is valid
    if (res.data && res.data.data) {
      const { projectSlug } = res.data.data;
      socket.emit('subscribe', projectSlug);
    }
  } catch (err) {
    console.error("Frontend Deployment Error:", err);
    // 500 error ka message logs mein dikhayein instead of crashing
    const errorMsg = err.response?.data?.details || err.response?.data?.error || "Deployment initiation failed.";
    setLogs((prev) => [...prev, `❌ Error: ${errorMsg}`]);
    setIsDeploying(false);
  }
};

  // --- RENDER ---
  if (!isAuthenticated) {
    return (
      <Auth 
        authMode={authMode} 
        setAuthMode={setAuthMode} 
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        authError={authError} 
        handleAuth={handleAuth} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans">
      <Navbar isDeploying={isDeploying} handleLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-8 py-12">
        <DeploymentPanel 
          projectName={projectName} setProjectName={setProjectName}
          repoUrl={repoUrl} setRepoUrl={setRepoUrl}
          handleDeploy={handleDeploy}
          isDeploying={isDeploying}
          steps={steps}
          currentStep={currentStep}
          logs={logs}
          logEndRef={logEndRef}
          setLogs={setLogs}
          deployLink={deployLink}
        />
        
        <History 
          history={history} 
          email={email} 
          fetchHistory={fetchHistory} 
        />
      </main>
    </div>
  );
}

export default App;
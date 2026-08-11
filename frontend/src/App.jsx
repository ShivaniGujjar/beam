import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import DeploymentPanel from './components/DeploymentPanel';
import History from './components/History';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://beam-api-server.onrender.com';
const SUPABASE_PROJECT_ID = "raxeapbmgaokvvivfymi"; // Your Supabase Project Subdomain

const socket = io(API_BASE_URL, { autoConnect: true });

const formatSlug = (name) => {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

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

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const path = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/signup'; 
    try {
      const res = await axios.post(`${API_BASE_URL}${path}`, { email, password });
      if (authMode === 'login') {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          setIsAuthenticated(true);
        }
      } else {
        setAuthMode('login');
      }
    } catch (err) {
      setAuthError("Auth Failed. Check Backend.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/projects/deployments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const historyData = Array.isArray(res.data) ? res.data : res.data.data;
      if (Array.isArray(historyData)) {
        setHistory([...historyData]); 
      }
    } catch (err) {
      console.error("❌ Fetch History Error:", err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const lastLog = logs[logs.length - 1];
    if (lastLog && typeof lastLog === 'string') {
      if (lastLog.includes('Cloning') || lastLog.includes('CLONING')) setCurrentStep(1);
      if (lastLog.includes('Installing') || lastLog.includes('Build') || lastLog.includes('BUILD')) setCurrentStep(2);
      if (lastLog.includes('Upload') || lastLog.includes('Supabase') || lastLog.includes('Beaming')) setCurrentStep(3);
      if (lastLog.includes('DEPLOYMENT COMPLETE') || lastLog.includes('READY')) setCurrentStep(4);
    }
  }, [logs]);

  useEffect(() => {
    const handleLog = (log) => {
      if (!log) return;
      const safeLog = typeof log === 'string' ? log : JSON.stringify(log);
      setLogs((prev) => [...prev, safeLog]);
    };

    const handleStatus = (data) => {
      console.log("📩 Socket Signal Received:", data); 
      const status = typeof data === 'string' ? data : data?.status;
      
      if (status === 'READY') {
        setCurrentStep(4);
        setIsDeploying(false);
        setLogs((prev) => [...prev, "✅ DEPLOYMENT COMPLETE: Site is Live!"]);
        
        const cleanSlug = formatSlug(projectName);
        
        // 💡 OPTION 1 FIX: Direct Supabase CDN Object URL
        const directLiveUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/deployments/outputs/${cleanSlug}/index.html`;
        setDeployLink(directLiveUrl);
        
        fetchHistory(); 
      }
    };

    socket.on('message', handleLog);
    socket.on('log', handleLog);
    socket.on('status', handleStatus);

    return () => {
      socket.off('message', handleLog);
      socket.off('log', handleLog);
      socket.off('status', handleStatus);
    };
  }, [projectName]);

  const handleDeploy = async () => {
    if (!repoUrl || !projectName) return;
    const token = localStorage.getItem('token');
    
    const formattedSlug = formatSlug(projectName);

    setIsDeploying(true);
    setLogs(["🚀 Beam Engine Starting..."]);
    setCurrentStep(1);
    setDeployLink('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/projects/deploy`, 
        { gitUrl: repoUrl, slug: formattedSlug },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        fetchHistory(); 
        socket.emit('subscribe', formattedSlug);
      }
    } catch (err) {
      setLogs((prev) => [...prev, `❌ Error: ${err.response?.data?.error || 'Deployment failed'}`]);
      setIsDeploying(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth authMode={authMode} setAuthMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} authError={authError} handleAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans">
      <Navbar isDeploying={isDeploying} handleLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <DeploymentPanel 
          projectName={projectName} 
          setProjectName={setProjectName} 
          repoUrl={repoUrl} 
          setRepoUrl={setRepoUrl} 
          handleDeploy={handleDeploy} 
          isDeploying={isDeploying} 
          steps={steps} 
          currentStep={currentStep} 
          logs={logs} 
          logEndRef={logEndRef} 
          setLogs={setLogs} 
          deployLink={deployLink} 
        />
        <History history={history} email={email} fetchHistory={fetchHistory} />
      </main>
    </div>
  );
}

export default App;
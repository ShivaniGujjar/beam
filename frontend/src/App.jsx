import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import DeploymentPanel from './components/DeploymentPanel';
import History from './components/History';

// ✅ API URL setup
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beam-ten-dusky.vercel.app';
const socket = io(API_BASE_URL);

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
      console.error("❌ Fetch Error:", err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  // Scroll to bottom when logs update
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ✅ Step Update Logic based on logs
  useEffect(() => {
    const lastLog = logs[logs.length - 1];
    if (lastLog) {
      if (lastLog.includes('Cloning')) setCurrentStep(1);
      if (lastLog.includes('Installing') || lastLog.includes('build')) setCurrentStep(2);
      if (lastLog.includes('Beaming')) setCurrentStep(3);
    }
  }, [logs]);

  // ✅ FIXED: Socket Listener for Status & Messages
  useEffect(() => {
    socket.on('message', (log) => setLogs((prev) => [...prev, log]));

    // 🚀 Yeh listener ab har status update ko check karega
    socket.on('status', (data) => {
      console.log("📩 Socket Signal Received:", data); // Browser console check karne ke liye
      
      // Agar data sirf "READY" string hai ya object hai, dono handle honge
      const status = typeof data === 'string' ? data : data.status;
      
      if (status === 'READY') {
        setCurrentStep(4);
        setIsDeploying(false);
        setLogs((prev) => [...prev, "✅ DEPLOYMENT COMPLETE: Site is Live!"]);
        
        const slug = projectName.toLowerCase().replace(/ /g, '-');
        setDeployLink(`http://${slug}.localhost:8000`);
        fetchHistory(); 
      }
    });

    return () => {
      socket.off('message');
      socket.off('status');
    };
  }, [projectName]);
  const handleDeploy = async () => {
    if (!repoUrl || !projectName) return;
    const token = localStorage.getItem('token');
    
    setIsDeploying(true);
    setLogs(["🚀 Beam Engine Starting..."]);
    setCurrentStep(1);
    setDeployLink('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/projects/deploy`, 
        { gitUrl: repoUrl, slug: projectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        fetchHistory(); 
        // Subscribe to project-specific socket room
        socket.emit('subscribe', projectName);
      }
    } catch (err) {
      setLogs((prev) => [...prev, `❌ Error: ${err.response?.data?.error || 'Failed'}`]);
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
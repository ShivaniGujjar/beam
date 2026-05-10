import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import DeploymentPanel from './components/DeploymentPanel';
import History from './components/History';

const socket = io('http://localhost:9000');

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
      const res = await axios.post(`http://localhost:9000${path}`, { email, password });
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
      const res = await axios.get('http://localhost:9000/api/v1/projects/deployments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📦 Raw Response:", res.data);

      // 💡 Kabhi-kabhi backend res.data.data bhejta hai, check for both
      const historyData = Array.isArray(res.data) ? res.data : res.data.data;

      if (Array.isArray(historyData)) {
        console.log("✅ Setting History State with:", historyData.length, "items");
        setHistory([...historyData]); // Spread operator se state trigger force karte hain
      } else {
        console.log("⚠️ Data is not an array, check controller response!");
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

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
        fetchHistory(); // ✅ Deployment complete hone par history update
      }
    }
  }, [logs]);

  useEffect(() => {
    socket.on('message', (log) => setLogs((prev) => [...prev, log]));
    return () => socket.off('message');
  }, []);

  const handleDeploy = async () => {
    if (!repoUrl || !projectName) return;
    const token = localStorage.getItem('token');
    
    setIsDeploying(true);
    setLogs(["🚀 Beam Engine Starting..."]);
    setCurrentStep(1);
    setDeployLink('');

    try {
      const res = await axios.post('http://localhost:9000/api/v1/projects/deploy', 
        { gitUrl: repoUrl, slug: projectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        // ✅ Database mein save hote hi history fetch kar lo taaki 'QUEUED' status dikhe
        fetchHistory(); 
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
        <DeploymentPanel projectName={projectName} setProjectName={setProjectName} repoUrl={repoUrl} setRepoUrl={setRepoUrl} handleDeploy={handleDeploy} isDeploying={isDeploying} steps={steps} currentStep={currentStep} logs={logs} logEndRef={logEndRef} setLogs={setLogs} deployLink={deployLink} />
        <History history={history} email={email} fetchHistory={fetchHistory} />
      </main>
    </div>
  );
}

export default App;
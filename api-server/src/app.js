const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// ✅ Update CORS Options
app.use(cors({
    origin: ["https://beam-ten-dusky.vercel.app", "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// 💡 Important: Isse controllers ko socket ka access mil jayega
app.set('io', null); 

app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/projects', projectRoutes);

module.exports = app;
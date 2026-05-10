const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 
const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 💡 Important: Isse controllers ko socket ka access mil jayega
app.set('io', null); 

app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/projects', projectRoutes);

module.exports = app;
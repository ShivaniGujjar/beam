const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// ✅ Allowed origins mein naya Vercel domain add kar diya
const allowedOrigins = [
  "https://beam-sable.vercel.app",
  "https://beam-ten-dusky.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback: Allow all Vercel previews dynamically
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.set('io', null); 

app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/projects', projectRoutes);

module.exports = app;
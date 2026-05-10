const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 💡 Secret ab seedha .env se aayega
const JWT_SECRET = process.env.JWT_SECRET; 

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Login Attempt:", email);

    // Dummy ID for now
    const userId = "663f1234567890abcdef1234"; 

    // 💡 IMPORTANT: Token generation mein wahi secret use ho raha hai
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
        message: "Login successful",
        token: token,
        user: { id: userId, email: email, name: "Beam User" }
    });
});

router.post('/signup', (req, res) => {
    res.status(201).json({ message: "Signup successful" });
});

module.exports = router;
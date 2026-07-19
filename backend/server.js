const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// SECURITY HEADERS (Temporarily disabled for debugging)
// const helmet = require('helmet');
// app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.disable('x-powered-by');

const PORT = process.env.PORT || 5000;

// CROSS-ORIGIN RESOURCE SHARING
const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
    origin: [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' })); // Increased limit to support Base64 profile pictures

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// DATABASE CONNECTION
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 5000
        });
        console.log('[DB-SUCCESS] MongoDB Connected Successfully');
    } catch (err) {
        console.error('[DB-ERROR] MongoDB Connection Error:', err.message);
        console.log('Attempting connection to local MongoDB fallback...');
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs', {
                serverSelectionTimeoutMS: 3000
            });
            console.log('[DB-SUCCESS] Connected to Local MongoDB Fallback');
        } catch (localErr) {
            console.error('[DB-FATAL] Local MongoDB connection also failed:', localErr.message);
            console.log('Keeping server alive in offline/unconnected mode.');
        }
    }
};
connectDB();

// WEBSOCKETS (SOCKET.IO)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    socket.on('join_order', (orderId) => {
        socket.join(orderId);
    });
});

app.set('socketio', io);

// ROUTES
app.get('/', (req, res) => res.send('DiagnoLabs API is running'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/india-labs', require('./routes/indiaLabs'));

app.use('/api/chat', require('./routes/chat'));
app.use('/api/collector', require('./routes/collector'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// ADMINISTRATIVE ACTIONS
app.post('/api/admin/sync-india', async (req, res) => {
    try {
        const { crawlIndiaUltra } = require('./scripts/massDiscovery');
        crawlIndiaUltra(); // Run in background - V3.0 (ULTRA)
        res.status(200).json("Bharat-Ultra V3.0 Started: Synchronizing 300+ Indian Districts in background.");
    } catch (err) {
        res.status(500).json(err);
    }
});


// UTILITY & HELPER ROUTES
app.get('/api/utils/geocode', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ error: 'Latitude and Longitude are required' });
        
        // Proxy through backend to satisfy Nominatim's strict User-Agent policy without exposing client IPs to rate-limiting
        const axios = require('axios');
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
                'User-Agent': 'DiagnoLabs-Clinical-System/1.0 (admin@diagnolabs.in)',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        
        res.json(response.data);
    } catch (err) {
        console.error('[GEOCODE ERROR]', err.message);
        res.status(500).json({ error: 'Failed to reverse geocode coordinates' });
    }
});

// STATIC ASSETS (Reports/Images)
app.use('/uploads', express.static('uploads'));

// --- GLOBAL ERROR CATCHING & AUTO-HEAL SYSTEM ---
// Prevents the Node.js process from crashing on random uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🔥 [AUTO-HEAL] Prevented Crash from Uncaught Exception:', err.message);
});

// Prevents the Node.js process from crashing on unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 [AUTO-HEAL] Prevented Crash from Unhandled Rejection:', reason);
});

// Express global error handler to prevent route crashes
app.use((err, req, res, next) => {
    console.error('🔥 [AUTO-HEAL] Express Route Error:', err.message);
    res.status(500).json({ error: "An internal error occurred, but the server auto-recovered." });
});
// ------------------------------------------------

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[GATEWAY] DiagnoLabs Clinical Services Active on Port ${PORT}`);
});

module.exports = app;

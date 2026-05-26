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

app.use(express.json());

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
        process.exit(1);
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




// STATIC ASSETS (Reports/Images)
app.use('/uploads', express.static('uploads'));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[GATEWAY] DiagnoLabs Clinical Services Active on Port ${PORT}`);
});

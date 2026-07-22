if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
    try {
        const dns = require('node:dns');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (e) {
        console.warn('DNS server override skipped:', e.message);
    }
}

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
const frontend_url = process.env.FRONTEND_URL;
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];
if (frontend_url) {
    allowedOrigins.push(frontend_url);
    allowedOrigins.push(frontend_url.replace(/\/$/, ""));
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server) or matched origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, "")) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, true); // Allow all during production deployment
        }
    },
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
        // Auto seed initial labs and tests if DB is empty
        seedInitialData();
    } catch (err) {
        console.error('[DB-ERROR] MongoDB Connection Error:', err.message);
        console.log('Attempting connection to local MongoDB fallback...');
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs', {
                serverSelectionTimeoutMS: 3000
            });
            console.log('[DB-SUCCESS] Connected to Local MongoDB Fallback');
            seedInitialData();
        } catch (localErr) {
            console.error('[DB-FATAL] Local MongoDB connection also failed:', localErr.message);
            console.log('Keeping server alive in offline/unconnected mode.');
        }
    }
};

const seedInitialData = async () => {
    try {
        const Lab = require('./models/Lab');
        const Test = require('./models/Test');
        const labCount = await Lab.countDocuments();
        if (labCount === 0) {
            console.log('[AUTO-SEED] Seeding initial sample labs and diagnostic tests into MongoDB Atlas...');
            const sampleLabs = [
                {
                    name: "Apollo Diagnostics Main Center",
                    address: "Road No 36, Jubilee Hills, Hyderabad",
                    city: "Hyderabad",
                    servicePincodes: ["500033", "500001", "500081", "500032"],
                    phone: "+91 40 2360 7777",
                    rating: 4.8,
                    totalReviews: 240,
                    location: { type: "Point", coordinates: [78.4071, 17.4325] },
                    isVerified: true
                },
                {
                    name: "Dr. Lal PathLabs Clinical Center",
                    address: "Banjara Hills Main Road, Hyderabad",
                    city: "Hyderabad",
                    servicePincodes: ["500034", "500001", "500081"],
                    phone: "+91 40 2335 8888",
                    rating: 4.7,
                    totalReviews: 180,
                    location: { type: "Point", coordinates: [78.4483, 17.4156] },
                    isVerified: true
                },
                {
                    name: "Metropolis Healthcare Diagnostics",
                    address: "Hitec City, Madhapur, Hyderabad",
                    city: "Hyderabad",
                    servicePincodes: ["500081", "500032", "500033"],
                    phone: "+91 40 4444 9999",
                    rating: 4.6,
                    totalReviews: 155,
                    location: { type: "Point", coordinates: [78.3813, 17.4435] },
                    isVerified: true
                }
            ];
            const insertedLabs = await Lab.insertMany(sampleLabs);
            
            const standardTests = [
                { testName: "Complete Blood Count (CBC)", price: 350, category: "Blood", description: "Assesses overall health and detects anemia and infections.", turnaroundTime: "12 Hours" },
                { testName: "Thyroid Profile (T3, T4, TSH)", price: 600, category: "Blood", description: "Evaluates thyroid gland function.", turnaroundTime: "24 Hours" },
                { testName: "Lipid Profile (Cholesterol)", price: 500, category: "Blood", description: "Measures cholesterol and lipid levels for heart health.", turnaroundTime: "12 Hours" },
                { testName: "Diabetes Screening (HbA1c & Fasting)", price: 450, category: "Blood", description: "Monitors long-term blood sugar levels.", turnaroundTime: "12 Hours" },
                { testName: "Kidney Function Test (KFT)", price: 700, category: "Urine", description: "Evaluates kidney performance.", turnaroundTime: "24 Hours" },
                { testName: "Liver Function Test (LFT)", price: 800, category: "Blood", description: "Measures liver enzymes and health.", turnaroundTime: "24 Hours" },
                { testName: "Vitamin D3 (25-Hydroxy)", price: 1200, category: "Blood", description: "Measures vitamin D for bone and immune health.", turnaroundTime: "24 Hours" },
                { testName: "Vitamin B12", price: 900, category: "Blood", description: "Assesses Vitamin B12 levels for nerve health.", turnaroundTime: "24 Hours" }
            ];

            const testsToInsert = [];
            insertedLabs.forEach(lab => {
                standardTests.forEach(test => {
                    testsToInsert.push({ ...test, lab: lab._id });
                });
            });
            await Test.insertMany(testsToInsert);
            console.log('[AUTO-SEED SUCCESS] Initial labs & diagnostic tests seeded successfully!');
        }
    } catch (e) {
        console.error('[AUTO-SEED ERROR]', e.message);
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

// SERVE REACT FRONTEND (Production)
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// React Router catch-all: serve index.html for all non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

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

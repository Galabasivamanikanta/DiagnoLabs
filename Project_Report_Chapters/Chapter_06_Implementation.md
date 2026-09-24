# CHAPTER 6 — IMPLEMENTATION

## 6.1 Introduction

This chapter covers the actual code and implementation details of DiagnoLabs. We translated the designs and database schemas into a working MERN stack application, handling everything from routing and UI state to complex backend algorithms.

## 6.2 Technology Stack

As detailed in Chapter 5 (Table 5.1), the system is built on React 18, Node.js 20 LTS, Express, and MongoDB Atlas. We used Tailwind CSS for styling.

## 6.3 Front End Development

The React frontend uses a component-based architecture. We used `react-router-dom` for handling the 14 different role workspaces. We built a custom `AuthContext` to manage the user's login state globally.

Here is a snippet of our `AuthContext` implementation:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

We also created a `useDevice` hook to easily conditionally render mobile vs desktop views, making the dashboards responsive.

## 6.4 Back End Development

The Express server handles all business logic. We structured it with routes, controllers, and middlewares. The middleware chain is crucial for security.

Here is our JWT verification and role-check middleware:

```javascript
const jwt = require('jsonwebtoken');

const requireAuth = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied for this role' });
      }
      
      req.user = decoded;
      next();
    });
  };
};

module.exports = requireAuth;
```

## 6.5 Geospatial Haversine Engine Implementation

To find the nearest diagnostic centers, we implemented the Haversine formula for geodesic distance calculations. We combined this with MongoDB's `2dsphere` index to achieve sub-12ms spatial queries.

```javascript
// Example of the MongoDB geospatial query in our controller
const findNearestLabs = async (req, res) => {
  const { lng, lat, maxDistance = 10000 } = req.query;

  try {
    const labs = await Lab.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance) // in meters
        }
      }
    });
    res.json(labs);
  } catch (err) {
    res.status(500).json({ error: 'Spatial query failed' });
  }
};
```

## 6.6 AI Health Assistant Implementation

We integrated Gemini 1.5 Flash using the Google Generative AI SDK to help patients understand their symptoms. Since APIs can fail, we built an offline fallback engine.

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateClinicalFallback = (symptoms) => {
  const commonIssues = {
    fever: "Please monitor your temperature and stay hydrated. Consult a doctor if it exceeds 103F.",
    headache: "Rest in a quiet, dark room. If persistent, book a consultation."
  };
  return commonIssues[symptoms.toLowerCase()] || "System offline. Please consult a doctor directly.";
};

const getAIResponse = async (prompt) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API failed, using fallback.");
    return generateClinicalFallback(prompt);
  }
};
```

## 6.7 Phlebotomist Dispatch, OTP Collection, and Cold-Chain Tracking

The home collection flow relies on a 4-digit OTP handshake.

```javascript
// OTP Generation
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Verification Controller
const verifyCollection = async (req, res) => {
  const { bookingId, otp, tempLog } = req.body;
  const booking = await Booking.findById(bookingId);
  
  if (booking.otp !== otp) {
    return res.status(400).json({ error: 'Invalid patient OTP' });
  }
  
  booking.status = 'Collected';
  booking.temperatureLog = tempLog;
  await booking.save();
  res.json({ message: 'Collection verified successfully' });
};
```

## 6.8 Pathology Report Generation and QR Verification

Reports are generated as PDFs. To prevent forgery, we append a SHA-256 hash of the report data and generate a QR code. When scanned, it verifies the hash against our database.

## 6.9 Challenges Faced and Solutions Applied

Building this wasn't easy. Here are some real problems we faced:
1.  **Gemini API Crashes:** We hit rate limits frequently. Solution: We built the `generateClinicalFallback` function to keep the bot functional offline.
2.  **CORS Issues:** The frontend couldn't talk to the backend during early development. Solution: Configured the `cors` middleware properly in Express with specific origin whitelisting.
3.  **MongoDB Connection Pooling:** We had multiple disconnects during load testing. Solution: Tweaked the Mongoose connection options (`maxPoolSize: 50`) to handle more concurrent requests.
4.  **Large Bundle Size:** The initial React build was too big because of Lucide icons. Solution: Used named imports (`import { User } from 'lucide-react'`) to enable tree-shaking.
5.  **Mobile Responsiveness:** Tables in the 14 dashboards were breaking on small screens. Solution: Used Tailwind's `overflow-x-auto` to make tables scrollable horizontally without breaking the page layout.

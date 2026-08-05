const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require("path");
const fs = require("fs");

let app;
try {
  let credentialSource;
  
  // For production (Render), read from env variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credentialSource = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // For local development, read from file
    const serviceAccountPath = path.resolve(__dirname, "../firebase-admin.json");
    credentialSource = require(serviceAccountPath);
  }

  app = initializeApp({
    credential: cert(credentialSource),
    storageBucket: "diagnolabs-62be3.firebasestorage.app"
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

// Export a wrapper that mimics the old admin API for backwards compatibility in routes
module.exports = {
  auth: () => getAuth(app)
};

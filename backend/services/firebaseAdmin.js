const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require("path");

const serviceAccountPath = path.resolve(__dirname, "../firebase-admin.json");

let app;
try {
  app = initializeApp({
    credential: cert(require(serviceAccountPath)),
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

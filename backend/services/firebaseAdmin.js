const admin = require("firebase-admin");
const path = require("path");

// Resolve path to the downloaded service account key
const serviceAccountPath = path.resolve(__dirname, "../firebase-admin.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

module.exports = admin;

const mongoose = require('mongoose');
require('dotenv').config();
const { crawlIndiaUltra } = require('./massDiscovery');

const DB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/diagnolabs";

console.log("[LAUNCH] DiagnoLabs National Discovery Engine");
console.log("[LAUNCH] Connecting to Clinical Data Gateway...");

mongoose.connect(DB_URI)
  .then(() => {
    console.log("[LAUNCH] MongoDB Connected Successfully.");
    return crawlIndiaUltra();
  })
  .then(() => {
    console.log("[LAUNCH] Global Process Complete.");
    process.exit(0);
  })
  .catch(err => {
    console.error("[LAUNCH] Critical System Error:", err);
    process.exit(1);
  });

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const Lab = require('./models/Lab');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diagnolabs')
  .then(async () => {
    const labs = await Lab.find({});
    const ratings = labs.map(l => l.rating).filter(r => r !== undefined);
    console.log("Min rating:", Math.min(...ratings));
    console.log("Max rating:", Math.max(...ratings));
    process.exit(0);
  });

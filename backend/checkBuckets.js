const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const Lab = require('./models/Lab');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diagnolabs')
  .then(async () => {
    const labs = await Lab.find({});
    const ratings = labs.map(l => l.rating).filter(r => r !== undefined);
    console.log("Count < 3.8:", ratings.filter(r => r < 3.8).length);
    console.log("Count < 4.0:", ratings.filter(r => r < 4.0).length);
    console.log("Count < 4.2:", ratings.filter(r => r < 4.2).length);
    console.log("Count < 4.4:", ratings.filter(r => r < 4.4).length);
    process.exit(0);
  });

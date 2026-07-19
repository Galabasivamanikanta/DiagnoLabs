const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const Lab = require('./models/Lab');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diagnolabs')
  .then(async () => {
    const total = await Lab.countDocuments();
    const over45 = await Lab.countDocuments({rating: {$gte: 4.5}});
    const over42 = await Lab.countDocuments({rating: {$gte: 4.2}});
    console.log('Total:', total);
    console.log('>= 4.5:', over45);
    console.log('>= 4.2:', over42);
    process.exit(0);
  });

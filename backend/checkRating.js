const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const Test = require('./models/Test');
require('./models/Lab');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diagnolabs')
  .then(async () => {
    const tests = await Test.find({}).populate('lab').limit(10);
    console.log(tests.map(t => t.lab.rating));
    process.exit(0);
  });

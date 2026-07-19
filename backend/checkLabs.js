const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const Lab = require('./models/Lab');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diagnolabs')
  .then(async () => {
    const labs = await Lab.find({});
    console.log(labs.map(l => ({ name: l.name, rating: l.rating, totalReviews: l.totalReviews, category: l.category })));
    process.exit(0);
  });

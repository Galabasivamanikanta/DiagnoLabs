const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diagnolabs')
  .then(async () => {
    const users = await User.find({});
    console.log('Users:', users.map(u => ({id: u._id, email: u.email})));
    process.exit(0);
  });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  // Find IT-001
  const user = await User.findOne({ employeeId: 'IT-001' });

  if (!user) {
    console.log('IT-001 NOT FOUND in DB.');
    // List all employees with IT prefix
    const all = await User.find({ role: 'it_specialist' });
    console.log('IT Specialists:', all.map(u => ({ id: u.employeeId, role: u.role })));
    // Also show all employee IDs
    const allEmps = await User.find({ role: { $nin: ['patient'] } }).select('employeeId role');
    console.log('All staff:', allEmps.map(u => u.employeeId + ' - ' + u.role));
  } else {
    const isBcrypt = user.password && user.password.startsWith('$2');
    console.log('Found IT-001:', {
      employeeId: user.employeeId,
      role: user.role,
      passLen: user.password?.length,
      isBcryptHashed: isBcrypt,
      isFirstLogin: user.isFirstLogin
    });

    if (!isBcrypt) {
      console.log('PASSWORD IS PLAIN TEXT — fixing now...');
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('123456', salt);
      await User.updateOne({ employeeId: 'IT-001' }, { $set: { password: hashed, isFirstLogin: true } });
      console.log('Fixed! Password is now bcrypt(123456)');
    } else {
      // Test if 123456 matches
      const isValid = await bcrypt.compare('123456', user.password);
      console.log('Does 123456 match?', isValid);
      if (!isValid) {
        console.log('Password mismatch! Resetting to 123456...');
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('123456', salt);
        await User.updateOne({ employeeId: 'IT-001' }, { $set: { password: hashed, isFirstLogin: true } });
        console.log('Reset done! Try logging in with IT-001 / 123456');
      }
    }
  }

  mongoose.disconnect();
}).catch(err => {
  console.error('DB Connection failed:', err.message);
  process.exit(1);
});

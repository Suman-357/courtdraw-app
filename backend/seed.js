require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Group = require('./models/Group');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to DB for seeding...'))
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

const seedDB = async () => {
  try {
    // Clear existing
    await User.deleteMany();
    await Group.deleteMany();
    console.log('Cleared existing users and groups.');

    // 1. Create a Super Admin Group
    const superGroup = await Group.create({
      name: 'Elite Badminton Club',
      code: 'SUPER1',
      adminId: new mongoose.Types.ObjectId() // temp ID
    });

    // 2. Create Super Admin User
    const superAdmin = await User.create({
      name: 'Super Admin',
      username: 'superadmin',
      email: 'superadmin@courtdraw.com',
      password: 'password123',
      role: 'superadmin',
      groupId: superGroup._id,
      isActive: true
    });
    
    superGroup.adminId = superAdmin._id;
    await superGroup.save();

    // 3. Create a Regular Admin Group
    const adminGroup = await Group.create({
      name: 'Weekend Warriors',
      code: 'ADMIN1',
      adminId: new mongoose.Types.ObjectId()
    });

    // 4. Create Admin User
    const admin = await User.create({
      name: 'Regular Admin',
      username: 'admin',
      email: 'admin@courtdraw.com',
      password: 'password123',
      role: 'admin',
      groupId: adminGroup._id,
      isActive: true
    });

    adminGroup.adminId = admin._id;
    await adminGroup.save();

    // 5. Create some Members for the Super Group so we can test Session Setup
    for (let i = 1; i <= 6; i++) {
      await User.create({
        name: `Player ${i}`,
        username: `player${i}`,
        email: `player${i}@courtdraw.com`,
        password: 'password123',
        role: 'member',
        groupId: superGroup._id,
        isActive: true
      });
    }

    console.log('Successfully seeded database!');
    console.log('-----------------------------------');
    console.log('Super Admin Login: superadmin / password123');
    console.log('Admin Login: admin / password123');
    console.log('Member Login: player1 / password123');
    console.log('-----------------------------------');
    
  } catch (error) {
    console.error('Error seeding DB:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedDB();

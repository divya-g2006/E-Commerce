import User from '../models/User.js';

export const ensureAdmins = async () => {
  const existingAdminCount = await User.countDocuments({ role: 'admin' });
  if (existingAdminCount > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('No admin user found. Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the initial admin account.');
    return;
  }

  const admin = new User({
    name: 'Admin',
    email,
    password,
    role: 'admin',
    seedEmail: email,
    isSeededAdmin: true,
  });

  await admin.save();
  console.log(`Seeded initial admin: ${email}`);
};

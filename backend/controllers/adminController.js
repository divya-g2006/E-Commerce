import User from '../models/User.js';

export const updateAdminProfile = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    const passwordRaw = req.body?.password;

    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
    const password = typeof passwordRaw === 'string' ? passwordRaw.trim() : '';

    if (!email && !password) {
      return res.status(400).json({ message: 'Provide at least one of: email, password' });
    }

    if (email) {
      const emailOk = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email);
      if (!emailOk) {
        return res.status(400).json({ message: 'Please provide a valid email' });
      }
    }

    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (email && email !== admin.email) {
      const existing = await User.findOne({ email, _id: { $ne: admin._id } });
      if (existing) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      admin.email = email;
    }

    if (password) {
      admin.password = password; // hashed by pre-save hook
    }

    admin.role = 'admin';
    admin.isSeededAdmin = true; // keep admin invariant in User pre-save hook

    await admin.save();

    res.json({
      message: 'Admin profile updated successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

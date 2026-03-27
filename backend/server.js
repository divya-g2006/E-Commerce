




// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/database.js';
// import authRoutes from './routes/auth.js';
// import productRoutes from './routes/products.js';
// import cartRoutes from './routes/cart.js';
// import orderRoutes from './routes/orders.js';
// import userRoutes from './routes/users.js';
// import { ensureAdmins } from './scripts/ensureAdmins.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();
//     await ensureAdmins();

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     }).on('error', (err) => {
//       console.error('Server failed to start:', err);
//     });
//   } catch (error) {
//     console.error('MongoDB connection failed:', error);
//     process.exit(1);
//   }
// };

// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   'http://localhost:5173',
//   'http://localhost:5174',
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//       return callback(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     credentials: true,
//   })
// );

// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/users', userRoutes);

// app.get('/', (req, res) => {
//   res.json({ message: 'E-Commerce API is running...' });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!', error: err.message });
// });

// startServer()







import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

import { ensureAdmins } from './scripts/ensureAdmins.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIXED CORS (MAIN FIX)
app.use(cors({
  origin: true,        // allow all origins
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Test route
app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API is running...' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// ✅ Start Server
const startServer = async () => {
  try {
    await connectDB();
    await ensureAdmins();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

startServer();

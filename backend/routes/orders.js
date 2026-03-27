import express from 'express';

import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getAdminOrders,
  updateOrderStatus,
  receiveOrder,
} from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Users
router.post('/', authenticate, createOrder);
router.get('/myorders', authenticate, getUserOrders);
router.put('/receive/:id', authenticate, receiveOrder);

// Admin
router.get('/admin', authenticate, authorizeAdmin, getAdminOrders);
// Compatibility alias (older clients / deployments)
router.get('/all', authenticate, authorizeAdmin, getAllOrders);
// Backward compatible (admin all orders)
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.put('/:id', authenticate, authorizeAdmin, updateOrderStatus);

export default router;

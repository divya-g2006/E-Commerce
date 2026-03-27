import express from 'express';
import { updateAdminProfile } from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.put('/update-profile', authenticate, authorizeAdmin, updateAdminProfile);

export default router;

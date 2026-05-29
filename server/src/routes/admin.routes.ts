import express from 'express';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/admin';
import {
    adminGetUsers,
    adminGetRewards,
    adminGetTransactions,
    adminAdjustPoints,
    adminDeleteReward
} from '../controllers/adminController';

const router = express.Router();

router.get('/users', auth, adminAuth, adminGetUsers);
router.get('/rewards', auth, adminAuth, adminGetRewards);
router.get('/transactions', auth, adminAuth, adminGetTransactions);
router.post('/users/:userId/points', auth, adminAuth, adminAdjustPoints);
router.delete('/rewards/:rewardId', auth, adminAuth, adminDeleteReward);

export default router;

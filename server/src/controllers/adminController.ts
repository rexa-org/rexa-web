import { Response } from 'express';
import { User } from '../models/user.model';
import { Reward } from '../models/reward.model';
import { Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middleware/auth';

export const adminGetUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

export const adminGetRewards = async (req: AuthRequest, res: Response) => {
    try {
        const rewards = await Reward.find()
            .populate('owner', 'name email role')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
        res.json(rewards);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch rewards', error: error.message });
    }
};

export const adminGetTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await Transaction.find()
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email')
            .populate('reward', 'title points')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};

export const adminAdjustPoints = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { points, type } = req.body; // points can be positive or negative

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const adjustment = Number(points);
        if (isNaN(adjustment)) {
            return res.status(400).json({ message: 'Invalid points amount' });
        }

        user.points = (user.points || 0) + adjustment;
        if (user.points < 0) user.points = 0; // prevent negative points

        if (adjustment > 0) {
            user.lifetimeEarned = (user.lifetimeEarned || 0) + adjustment;
        } else {
            user.lifetimeSpent = (user.lifetimeSpent || 0) + Math.abs(adjustment);
        }

        await user.save();

        // Create transaction log
        const transaction = new Transaction({
            toUser: user._id,
            points: adjustment,
            type: 'admin_adjustment'
        });
        await transaction.save();

        res.json({
            message: `Successfully adjusted points by ${adjustment} for user ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                points: user.points,
                lifetimeEarned: user.lifetimeEarned,
                lifetimeSpent: user.lifetimeSpent
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to adjust points', error: error.message });
    }
};

export const adminDeleteReward = async (req: AuthRequest, res: Response) => {
    try {
        const { rewardId } = req.params;
        const reward = await Reward.findById(rewardId);
        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        await Reward.findByIdAndDelete(rewardId);
        res.json({ message: `Reward ${reward.title} deleted successfully by admin` });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete reward', error: error.message });
    }
};

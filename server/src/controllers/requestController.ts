import { Response } from 'express';
import ExchangeRequest from '../models/Request';
import { Reward } from '../models/reward.model';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

export const createRequest = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderId = req.user?.userId;
    if (!senderId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { rewardId } = req.params;
    const { offeredRewardId, offeredPoints, message } = req.body;

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    if (reward.status !== 'available') {
      return res.status(400).json({ message: 'Reward is not available for exchange' });
    }

    if (reward.owner.toString() === senderId) {
      return res.status(400).json({ message: 'Cannot request your own reward' });
    }

    // If A offers one of A's rewards
    let offeredRewardDoc = null;
    if (offeredRewardId) {
      offeredRewardDoc = await Reward.findById(offeredRewardId);
      if (!offeredRewardDoc) {
        return res.status(404).json({ message: 'Offered reward not found' });
      }
      if (offeredRewardDoc.owner.toString() !== senderId) {
        return res.status(400).json({ message: 'You do not own the offered reward' });
      }
      if (offeredRewardDoc.status !== 'available') {
        return res.status(400).json({ message: 'Offered reward is not available for exchange' });
      }
    }

    // If A offers points
    const pointsToSend = Number(offeredPoints) || 0;
    if (pointsToSend > 0) {
      const senderUser = await User.findById(senderId);
      if (!senderUser || senderUser.points < pointsToSend) {
        return res.status(400).json({ message: 'Insufficient points to offer' });
      }
    }

    const existingRequest = await ExchangeRequest.findOne({
      reward: rewardId,
      sender: senderId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists for this reward' });
    }

    const request = new ExchangeRequest({
      reward: rewardId,
      sender: senderId,
      receiver: reward.owner,
      offeredReward: offeredRewardId || undefined,
      offeredPoints: pointsToSend || undefined,
      message
    });

    await request.save({ session });
    
    // Set requested reward to pending (or keep as available? Usually when an offer is made, 
    // the reward is kept available until an offer is accepted. Let's keep it available so multiple users can propose offers, 
    // but we can set its status to pending if needed. The original code set it to 'pending'. 
    // Let's set it to 'pending' for consistency, but a swap is more flexible if rewards remain visible).
    // Let's mark it as 'pending' to preserve existing flow.
    reward.status = 'pending';
    await reward.save({ session });

    if (offeredRewardDoc) {
      offeredRewardDoc.status = 'pending';
      await offeredRewardDoc.save({ session });
    }

    await session.commitTransaction();
    
    await request.populate('sender', 'name email');
    await request.populate('reward');
    if (offeredRewardId) {
      await request.populate('offeredReward');
    }
    
    res.status(201).json(request);
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error creating exchange request:', error);
    res.status(400).json({ message: error.message || 'Error creating request' });
  } finally {
    session.endSession();
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const sentRequests = await ExchangeRequest.find({ sender: userId })
      .populate('reward')
      .populate('offeredReward')
      .populate('receiver', 'name email trustScore role');

    const receivedRequests = await ExchangeRequest.find({ receiver: userId })
      .populate('reward')
      .populate('offeredReward')
      .populate('sender', 'name email trustScore role');

    res.json({
      sent: sentRequests,
      received: receivedRequests
    });
  } catch (error) {
    console.error('Error in getMyRequests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const request = await ExchangeRequest.findOne({
      _id: req.params.id,
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('reward')
      .populate('offeredReward')
      .populate('sender', 'name email trustScore role')
      .populate('receiver', 'name email trustScore role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error in getRequestById:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
};

export const respondToRequest = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receiverId = req.user?.userId;
    if (!receiverId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const request = await ExchangeRequest.findOne({
      _id: req.params.id,
      receiver: receiverId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const { response } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response' });
    }

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reward = await Reward.findById(request.reward);
    if (!reward) {
      return res.status(404).json({ message: 'Requested reward not found' });
    }

    let offeredReward = null;
    if (request.offeredReward) {
      offeredReward = await Reward.findById(request.offeredReward);
      if (!offeredReward) {
        return res.status(404).json({ message: 'Offered reward not found' });
      }
    }

    if (response === 'accepted') {
      // 1. Swap ownership and transfer points atomically
      // B (receiver) owns 'reward'. B's reward becomes A's (sender).
      // A (sender) owns 'offeredReward' (if any). A's reward becomes B's (receiver).

      // Update Points if any points are offered
      const pointsToTransfer = request.offeredPoints || 0;
      if (pointsToTransfer > 0) {
        if (sender.points < pointsToTransfer) {
          return res.status(400).json({ message: 'Sender has insufficient points to complete exchange' });
        }
        
        // Debit sender, credit receiver
        await User.findOneAndUpdate(
          { _id: sender._id },
          { 
            $inc: { 
              points: -pointsToTransfer,
              lifetimeSpent: pointsToTransfer
            } 
          },
          { session }
        );

        await User.findOneAndUpdate(
          { _id: receiver._id },
          { 
            $inc: { 
              points: pointsToTransfer,
              lifetimeEarned: pointsToTransfer
            } 
          },
          { session }
        );
      }

      // Perform ownership swaps on rewards
      // Swap requested reward: owner becomes sender (A). Status is reset to available for A to redeem/resell!
      reward.owner = sender._id;
      reward.status = 'available';
      await reward.save({ session });

      if (offeredReward) {
        // Swap offered reward: owner becomes receiver (B). Status reset to available!
        offeredReward.owner = receiver._id;
        offeredReward.status = 'available';
        await offeredReward.save({ session });
      }

      // Increment both users' trust ratings upon a successful exchange
      await User.findOneAndUpdate(
        { _id: sender._id },
        { 
          $inc: { 
            ratingsSum: 5, // automatic 5-star rating for successful swap
            ratingsCount: 1 
          }
        },
        { session }
      );
      
      await User.findOneAndUpdate(
        { _id: receiver._id },
        { 
          $inc: { 
            ratingsSum: 5,
            ratingsCount: 1 
          }
        },
        { session }
      );

      // Save request status
      request.status = 'accepted';
      await request.save({ session });

      // Create detailed Transaction record
      const transaction = new Transaction({
        fromUser: sender._id,
        toUser: receiver._id,
        points: pointsToTransfer || reward.points, // Points value of swap
        reward: reward._id,
        offeredReward: offeredReward ? offeredReward._id : undefined,
        type: 'exchange'
      });
      await transaction.save({ session });

      // Cancel/reject other pending requests for BOTH of these rewards because they have been swapped/completed!
      await ExchangeRequest.updateMany(
        {
          _id: { $ne: request._id },
          status: 'pending',
          $or: [
            { reward: reward._id },
            { offeredReward: reward._id },
            ...(offeredReward ? [
              { reward: offeredReward._id },
              { offeredReward: offeredReward._id }
            ] : [])
          ]
        },
        { status: 'rejected' },
        { session }
      );

    } else {
      // If rejected
      request.status = 'rejected';
      await request.save({ session });

      // Restore reward statuses back to 'available'
      reward.status = 'available';
      await reward.save({ session });

      if (offeredReward) {
        offeredReward.status = 'available';
        await offeredReward.save({ session });
      }
    }

    await session.commitTransaction();
    res.json(request);
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error responding to exchange request:', error);
    res.status(400).json({ message: error.message || 'Error responding to request' });
  } finally {
    session.endSession();
  }
};
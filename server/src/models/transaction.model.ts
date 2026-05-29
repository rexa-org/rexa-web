import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    fromUser?: mongoose.Types.ObjectId;
    toUser?: mongoose.Types.ObjectId;
    points: number;
    reward?: mongoose.Types.ObjectId;
    offeredReward?: mongoose.Types.ObjectId;
    type: 'redemption' | 'exchange' | 'checkin' | 'signup_bonus' | 'admin_adjustment';
    createdAt: Date;
}

const transactionSchema = new Schema({
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    points: {
        type: Number,
        required: true
    },
    reward: {
        type: Schema.Types.ObjectId,
        ref: 'Reward',
        required: false
    },
    offeredReward: {
        type: Schema.Types.ObjectId,
        ref: 'Reward',
        required: false
    },
    type: {
        type: String,
        enum: ['redemption', 'exchange', 'checkin', 'signup_bonus', 'admin_adjustment'],
        default: 'redemption'
    }
}, {
    timestamps: true
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema); 
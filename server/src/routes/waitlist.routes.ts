import { Router } from 'express';
import Waitlist from '../models/waitlist.model';

const router = Router();

router.post('/join', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Normalize email
    const cleanEmail = email.trim().toLowerCase();

    // Check if already in waitlist
    const existing = await Waitlist.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(200).json({ message: 'You are already on the waitlist!', alreadyExists: true });
    }
    
    const newEntry = new Waitlist({ email: cleanEmail });
    await newEntry.save();
    
    res.status(201).json({ message: 'Successfully joined the waitlist!' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(200).json({ message: 'You are already on the waitlist!', alreadyExists: true });
    }
    next(error);
  }
});

export default router;

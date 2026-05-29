import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { CONFIG } from '../config/config';

const promoteAdmin = async () => {
    // Get email from command line arguments
    const email = process.argv[2];
    if (!email) {
        console.error('❌ Please provide the email address of the user to promote.');
        console.error('Usage: npx ts-node src/scripts/promoteAdmin.ts <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(CONFIG.MONGODB_URI!);
        console.log('Connected to MongoDB Atlas');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ User with email "${email}" not found.`);
            await mongoose.connection.close();
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`🎉 Successfully promoted user "${user.name}" (${email}) to Admin!`);
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Promotion error:', error);
        process.exit(1);
    }
};

promoteAdmin();

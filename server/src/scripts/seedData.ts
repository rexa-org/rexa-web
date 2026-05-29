import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Reward } from '../models/reward.model';
import ExchangeRequest from '../models/Request';
import { Transaction } from '../models/transaction.model';
import { CONFIG } from '../config/config';

const seedData = async () => {
    try {
        await mongoose.connect(CONFIG.MONGODB_URI!);
        console.log('Connected to MongoDB Atlas');

        // Clear existing collections
        console.log('Clearing old database records...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Reward.deleteMany({}),
            ExchangeRequest.deleteMany({}),
            Transaction.deleteMany({})
        ]);
        console.log('Cleared all collections.');

        // 1. Create 10 Mock Users
        console.log('Creating 10 mock users...');
        const usersData = [
            { name: 'John Admin', email: 'admin@rexa.com', password: 'password123', points: 950, isVerified: true, role: 'admin', trustScore: 100, lifetimeEarned: 1250, lifetimeSpent: 300 },
            { name: 'Jane User', email: 'jane@rexa.com', password: 'password123', points: 520, isVerified: true, role: 'user', trustScore: 98, lifetimeEarned: 720, lifetimeSpent: 200 },
            { name: 'Bob Trader', email: 'bob@rexa.com', password: 'password123', points: 380, isVerified: true, role: 'user', trustScore: 94, lifetimeEarned: 780, lifetimeSpent: 400 },
            { name: 'Alice Shopaholic', email: 'alice@rexa.com', password: 'password123', points: 400, isVerified: true, role: 'user', trustScore: 96, lifetimeEarned: 800, lifetimeSpent: 400 },
            { name: 'Charlie Streamer', email: 'charlie@rexa.com', password: 'password123', points: 220, isVerified: true, role: 'user', trustScore: 90, lifetimeEarned: 520, lifetimeSpent: 300 },
            { name: 'David Gamer', email: 'david@rexa.com', password: 'password123', points: 380, isVerified: true, role: 'user', trustScore: 95, lifetimeEarned: 880, lifetimeSpent: 500 },
            { name: 'Eve Foodie', email: 'eve@rexa.com', password: 'password123', points: 450, isVerified: true, role: 'user', trustScore: 97, lifetimeEarned: 650, lifetimeSpent: 200 },
            { name: 'Frank Active', email: 'frank@rexa.com', password: 'password123', points: 150, isVerified: true, role: 'user', trustScore: 89, lifetimeEarned: 450, lifetimeSpent: 300 },
            { name: 'Grace Voyager', email: 'grace@rexa.com', password: 'password123', points: 600, isVerified: true, role: 'user', trustScore: 99, lifetimeEarned: 1200, lifetimeSpent: 600 },
            { name: 'Henry Health', email: 'henry@rexa.com', password: 'password123', points: 250, isVerified: true, role: 'user', trustScore: 92, lifetimeEarned: 550, lifetimeSpent: 300 }
        ];

        const users = await User.create(usersData);
        const [admin, jane, bob, alice, charlie, david, eve, frank, grace, henry] = users;
        console.log(`Created ${users.length} mock users successfully.`);

        // 2. Create 6 Premium Categories
        console.log('Creating premium categories...');
        const categories = await Category.create([
            { name: 'Shopping', slug: 'shopping', icon: 'FiShoppingBag', description: 'E-commerce gift cards, retail vouchers, and shopping coupons.' },
            { name: 'Streaming', slug: 'streaming', icon: 'FiVideo', description: 'Streaming subscriptions (music, video, platforms).' },
            { name: 'Dining', slug: 'dining', icon: 'FiCoffee', description: 'Restaurant cards, coffee coupons, and fast-food delivery.' },
            { name: 'Gaming', slug: 'gaming', icon: 'FiAward', description: 'Steam, Xbox, PlayStation wallet keys, and game codes.' },
            { name: 'Travel', slug: 'travel', icon: 'FiCompass', description: 'Ride-sharing coupons, hotel discounts, flight gift cards.' },
            { name: 'Wellness', slug: 'wellness', icon: 'FiHeart', description: 'Spa, gym membership passes, and health supplements coupons.' }
        ]);
        const [shopping, streaming, dining, gaming, travel, wellness] = categories;
        console.log(`Created ${categories.length} categories.`);

        // Pools of Unsplash images
        const images = {
            shopping: [
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=600&q=80'
            ],
            streaming: [
                'https://images.unsplash.com/photo-1574375927938-d5a98e8fed85?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=600&q=80'
            ],
            dining: [
                'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
            ],
            gaming: [
                'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=600&q=80'
            ],
            travel: [
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80'
            ],
            wellness: [
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80'
            ]
        };

        // 3. Create 50 Reward Listings
        console.log('Generating 50 rewards...');
        const exp = new Date();
        exp.setFullYear(exp.getFullYear() + 1);

        const rewardTemplates = [
            { title: 'Amazon $25 Gift Card', category: 'shopping', points: 250, desc: 'Digital code redeemable for any item on Amazon.' },
            { title: 'Amazon $50 Gift Card', category: 'shopping', points: 500, desc: 'Premium gift card code for shopping on Amazon.' },
            { title: 'Target $15 Voucher', category: 'shopping', points: 150, desc: 'Shop electronics, apparel, or grocery items at Target.' },
            { title: 'Target $30 Voucher', category: 'shopping', points: 300, desc: 'Target retail voucher code to spend in-store or online.' },
            { title: 'Walmart $20 Gift Card', category: 'shopping', points: 200, desc: 'Walmart voucher for groceries, toys, and household products.' },
            { title: 'Best Buy $100 Gift Card', category: 'shopping', points: 1000, desc: 'High-value code valid for appliances and tech at Best Buy.' },
            { title: 'eBay $25 Gift Voucher', category: 'shopping', points: 250, desc: 'Voucher valid for millions of items on the eBay auction store.' },
            
            { title: 'Netflix 1-Month Premium', category: 'streaming', points: 100, desc: 'Netflix UHD subscription code for 1 month.' },
            { title: 'Netflix 3-Month Premium', category: 'streaming', points: 300, desc: 'Stream movies and TV shows ad-free for 3 months.' },
            { title: 'Spotify Premium 3-Month', category: 'streaming', points: 200, desc: 'Spotify Premium key for 3 months of ad-free music.' },
            { title: 'Spotify Premium 6-Month', category: 'streaming', points: 400, desc: 'Premium subscription voucher to listen to offline tracks.' },
            { title: 'YouTube Premium 3-Month', category: 'streaming', points: 150, desc: 'Watch videos ad-free and listen to YouTube Music background play.' },
            { title: 'Disney+ Annual Pass', category: 'streaming', points: 800, desc: 'Voucher code for 1 full year of Disney+ and Pixar streams.' },
            
            { title: 'Starbucks $5 Coffee Card', category: 'dining', points: 50, desc: 'Starbucks card code for a delicious breakfast latte.' },
            { title: 'Starbucks $15 Coffee Card', category: 'dining', points: 150, desc: 'Voucher code for drinks, pastries, or mugs at Starbucks.' },
            { title: 'Uber Eats $10 Promo', category: 'dining', points: 100, desc: 'Uber Eats food delivery credit code.' },
            { title: 'Uber Eats $20 Promo', category: 'dining', points: 200, desc: 'Discount code to order lunch or dinner at Uber Eats.' },
            { title: 'DoorDash $15 Gift Code', category: 'dining', points: 150, desc: 'Prepaid code to order dinner from local restaurants.' },
            { title: 'DoorDash $30 Gift Code', category: 'dining', points: 300, desc: 'DoorDash food delivery gift voucher code.' },
            { title: 'Domino’s Large Pizza Card', category: 'dining', points: 120, desc: 'Voucher code for a hot, fresh Domino’s pizza.' },
            
            { title: 'Steam $10 Wallet Key', category: 'gaming', points: 100, desc: 'Wallet voucher to add $10 to Steam.' },
            { title: 'Steam $20 Wallet Key', category: 'gaming', points: 200, desc: 'Steam funds code to buy games, software, and card drops.' },
            { title: 'Steam $50 Wallet Key', category: 'gaming', points: 500, desc: 'High-value code to load Steam wallet balance.' },
            { title: 'Xbox $10 Game Pass', category: 'gaming', points: 100, desc: 'Voucher for Xbox Game Pass subscription.' },
            { title: 'PlayStation $25 Network Card', category: 'gaming', points: 250, desc: 'Prepaid wallet code for the PlayStation Store.' },
            { title: 'Nintendo eShop $20 Card', category: 'gaming', points: 200, desc: 'eShop code to purchase Switch indie games.' },
            { title: 'Roblox 800 Robux Code', category: 'gaming', points: 120, desc: 'Roblox gaming currency pin code.' },
            
            { title: 'Uber $15 Ride Credit', category: 'travel', points: 150, desc: 'Uber transport voucher code for travel.' },
            { title: 'Uber $25 Ride Credit', category: 'travel', points: 250, desc: 'Prepaid ride code to discount your airport taxi.' },
            { title: 'Airbnb $50 Stay Card', category: 'travel', points: 500, desc: 'Stay anywhere in the world with Airbnb cabin discounts.' },
            { title: 'Airbnb $100 Stay Card', category: 'travel', points: 1000, desc: 'Airbnb gift card code to discount holiday hotel bookings.' },
            { title: 'Airbnb $200 Stay Card', category: 'travel', points: 2000, desc: 'High-value holiday stay voucher code.' },
            { title: 'Delta Airlines $50 Voucher', category: 'travel', points: 500, desc: 'Delta flight booking discount card code.' },
            
            { title: 'Gympass 1-Month Premium', category: 'wellness', points: 250, desc: '1 month of unlimited entries to gyms near you.' },
            { title: 'Sephora $15 Beauty Pass', category: 'wellness', points: 150, desc: 'Sephora voucher valid for cosmetics and makeup items.' },
            { title: 'Sephora $30 Beauty Pass', category: 'wellness', points: 300, desc: 'Gift voucher code valid in-store at Sephora.' },
            { title: 'Ulta Beauty $20 Card', category: 'wellness', points: 200, desc: 'Ulta cosmetic shop discount card code.' },
            { title: 'Nike $25 Shop Card', category: 'wellness', points: 250, desc: 'Voucher code to purchase Nike shoes, shorts, or shirts.' }
        ];

        const rewardsData: any[] = [];
        
        // Loop to generate exactly 50 rewards from templates
        for (let i = 0; i < 50; i++) {
            const template = rewardTemplates[i % rewardTemplates.length];
            const categoryName = template.category;
            
            // Map category name to ID
            let categoryObj = shopping;
            if (categoryName === 'streaming') categoryObj = streaming;
            else if (categoryName === 'dining') categoryObj = dining;
            else if (categoryName === 'gaming') categoryObj = gaming;
            else if (categoryName === 'travel') categoryObj = travel;
            else if (categoryName === 'wellness') categoryObj = wellness;

            // Rotate images
            const imgPool = images[categoryName as keyof typeof images];
            const image_url = imgPool[i % imgPool.length];

            // Random owner (excluding admin for most to simulate user listings)
            const randomOwnerIndex = 1 + (i % (users.length - 1)); // 1 to 9
            const ownerObj = users[randomOwnerIndex];

            // Setup statuses (Available, Redeemed, Exchanged, Pending)
            let status = 'available';
            let redeemedBy = undefined;
            let redeemedAt = undefined;

            if (i >= 38 && i < 44) {
                // 6 rewards marked as redeemed
                status = 'redeemed';
                const randomBuyerIndex = (randomOwnerIndex + 1) % users.length;
                redeemedBy = users[randomBuyerIndex]._id;
                redeemedAt = new Date(Date.now() - (i % 7) * 24 * 60 * 60 * 1000);
            } else if (i >= 44 && i < 47) {
                // 3 rewards marked as exchanged
                status = 'exchanged';
            } else if (i >= 47) {
                // 3 rewards marked as pending swap
                status = 'pending';
            }

            rewardsData.push({
                title: `${template.title} #${i + 1}`,
                description: `${template.desc} Perfect for peer exchange swaps and digital redemptions. Sample voucher seed ID #${i + 1000}.`,
                image_url,
                points: template.points,
                code: `SAMPLE-CODE-VOUCH-${i + 1000}-XYZ`,
                owner: ownerObj._id,
                status,
                category: categoryObj._id,
                expiryDate: exp,
                isActive: status === 'available',
                redeemedBy,
                redeemedAt
            });
        }

        const seededRewards = await Reward.create(rewardsData);
        console.log(`Seeded exactly ${seededRewards.length} rewards into MongoDB.`);

        // 4. Create Active Swap Exchange Requests (5 Pending requests)
        console.log('Creating active swap requests...');
        const pendingRewards = seededRewards.filter(r => r.status === 'pending');
        
        // Ensure we create active swap requests for pending items
        const swapRequestsData = [
            {
                reward: pendingRewards[0]._id, // Owned by David Gamer (or another user)
                sender: jane._id,
                receiver: pendingRewards[0].owner,
                offeredReward: seededRewards[2]._id, // Starbucks 15 card (owned by Jane)
                offeredPoints: 100,
                message: 'Hey! Offering my Starbucks card + 100 points offset for your pending reward. Let me know!',
                status: 'pending',
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
            },
            {
                reward: pendingRewards[1]._id,
                sender: bob._id,
                receiver: pendingRewards[1].owner,
                offeredReward: seededRewards[4]._id, // Uber Eats card (owned by Bob)
                offeredPoints: 50,
                message: 'Uber Eats voucher plus points offset trade.',
                status: 'pending',
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
            },
            {
                reward: pendingRewards[2]._id,
                sender: alice._id,
                receiver: pendingRewards[2].owner,
                offeredPoints: 150,
                message: 'Direct swap proposed using point offset credit only.',
                status: 'pending',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
        ];
        
        const seededRequests = await ExchangeRequest.create(swapRequestsData);
        console.log(`Created ${seededRequests.length} pending exchange swap requests.`);

        // 5. Create 50+ Transactions (Signup, checkins, redemptions, adjustments)
        console.log('Creating 50+ transaction ledger records...');
        const transactionsData: any[] = [];

        // All 10 users get signups (10 transactions)
        users.forEach(u => {
            transactionsData.push({
                toUser: u._id,
                points: 100,
                type: 'signup_bonus',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            });
        });

        // 25 Check-ins (Multiple days of history for each user)
        for (let day = 1; day <= 5; day++) {
            users.forEach((u, index) => {
                if ((index + day) % 2 === 0) { // Alternate checkins
                    transactionsData.push({
                        toUser: u._id,
                        points: 50,
                        type: 'checkin',
                        createdAt: new Date(Date.now() - day * 24 * 60 * 60 * 1000)
                    });
                }
            });
        }

        // Transactions for the 6 redeemed rewards
        const redeemedRewardsList = seededRewards.filter(r => r.status === 'redeemed');
        redeemedRewardsList.forEach((r, idx) => {
            transactionsData.push({
                fromUser: r.redeemedBy,
                toUser: r.owner,
                points: r.points,
                reward: r._id,
                type: 'redemption',
                createdAt: r.redeemedAt || new Date(Date.now() - idx * 24 * 60 * 60 * 1000)
            });
        });

        // Transactions for the 3 exchanged rewards
        const exchangedRewardsList = seededRewards.filter(r => r.status === 'exchanged');
        exchangedRewardsList.forEach((r, idx) => {
            // Swap between Bob and Alice
            transactionsData.push({
                fromUser: bob._id,
                toUser: alice._id,
                points: r.points,
                reward: r._id,
                type: 'exchange',
                createdAt: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000)
            });
        });

        // Admin Adjustments (6 adjustments)
        const adjustments = [
            { user: jane._id, amt: 200 },
            { user: bob._id, amt: -100 },
            { user: alice._id, amt: 150 },
            { user: david._id, amt: 120 },
            { user: grace._id, amt: 300 },
            { user: frank._id, amt: -50 }
        ];

        adjustments.forEach((adj, idx) => {
            transactionsData.push({
                fromUser: adj.amt < 0 ? adj.user : undefined,
                toUser: adj.amt > 0 ? adj.user : undefined,
                points: Math.abs(adj.amt),
                type: 'admin_adjustment',
                createdAt: new Date(Date.now() - (idx + 2) * 24 * 60 * 60 * 1000)
            });
        });

        const seededTransactions = await Transaction.create(transactionsData);
        console.log(`Generated exactly ${seededTransactions.length} transactions in history logs.`);

        console.log('🎉 Database seeding successfully completed with 50 rewards and 50+ transactions!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();

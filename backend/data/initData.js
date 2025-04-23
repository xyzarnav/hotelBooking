import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Room from '../models/Room.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const rooms = [
  {
    name: "Taj Lake Palace Suite",
    type: "Heritage Suite",
    price: 35000,
    description: "Experience royalty in this iconic white marble palace floating on Lake Pichola with stunning views of Udaipur. Features traditional Rajasthani decor, king-size bed, and private butler service.",
    imageUrl: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Kerala Houseboat Villa",
    type: "Houseboat Suite",
    price: 18000,
    description: "Traditional Kerala houseboat with modern amenities cruising through the serene backwaters of Alleppey. Includes private deck, chef-prepared Kerala cuisine, and panoramic water views.",
    imageUrl: "https://images.unsplash.com/photo-1590080552494-dcda852944ff?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Himalayan Mountain Retreat",
    type: "Luxury Cottage",
    price: 15000,
    description: "Peaceful cottage nestled in the Himalayas with breathtaking views of snow-capped peaks. Features handcrafted furniture, fireplace, and floor-to-ceiling windows.",
    imageUrl: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Golden Triangle Haveli Room",
    type: "Heritage Double",
    price: 12000,
    description: "Authentic restored haveli in Jaipur's old city with ornate jharokha windows, hand-painted murals, and a private courtyard garden perfect for experiencing royal Rajasthani hospitality.",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Mumbai Sea View Studio",
    type: "Premium Single",
    price: 8000,
    description: "Contemporary studio apartment overlooking the Arabian Sea at Marine Drive, offering modern amenities, kitchenette, and easy access to Mumbai's vibrant nightlife and business districts.",
    imageUrl: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Goa Beachfront Cottage",
    type: "Family Villa",
    price: 20000,
    description: "Spacious family cottage steps from Goa's pristine beaches with private garden, outdoor dining area, and hammocks under palm trees. Perfect for a relaxing family getaway.",
    imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Mysore Palace View Suite",
    type: "Royal Suite",
    price: 25000,
    description: "Luxurious suite with a direct view of the illuminated Mysore Palace. Features colonial-style furniture, four-poster bed, and private balcony to enjoy the palace light show.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    available: true
  },
  {
    name: "Darjeeling Tea Estate Bungalow",
    type: "Heritage Villa",
    price: 16000,
    description: "Colonial-era bungalow surrounded by working tea gardens with misty mountain views. Includes veranda, English garden, and complimentary tea tasting sessions.",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop",
    available: true
  }
];

const initializeData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@hotel.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@hotel.com',
        password: 'admin123',
        isAdmin: true,
        wallet: 1000000  // 10 lakh INR
      });
      console.log('Admin user created');
    }

    // Add rooms
    await Room.deleteMany({});
    await Room.insertMany(rooms);
    console.log('Sample rooms created');

    console.log('Data initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initializeData();

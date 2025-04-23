import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
    try {
        let rooms = await Room.find({});
        if (rooms.length === 0) {
            // Insert default rooms if none exist
            const defaultRooms = [
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
                }
            ];
            await Room.insertMany(defaultRooms);
            rooms = await Room.find({});
        }
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createRoom = async (req, res) => {
    try {
        const { name, type, price, description, imageUrl } = req.body;
        const room = await Room.create({
            name,
            type,
            price,
            description,
            imageUrl
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            room.name = req.body.name || room.name;
            room.type = req.body.type || room.type;
            room.price = req.body.price || room.price;
            room.description = req.body.description || room.description;
            room.imageUrl = req.body.imageUrl || room.imageUrl;
            room.available = req.body.available ?? room.available;

            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            await room.deleteOne();
            res.json({ message: 'Room removed' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

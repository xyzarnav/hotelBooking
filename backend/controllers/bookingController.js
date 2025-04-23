import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Room from '../models/Room.js'; // Add this missing import

export const createBooking = async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;
        
        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkIn < today) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past' });
        }
        
        if (checkIn >= checkOut) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }
        
        // Calculate stay length and validate price
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const expectedPrice = room.price * nights;
        if (Math.abs(expectedPrice - totalPrice) > 1) { // Allow for small rounding differences
            return res.status(400).json({ 
                message: 'Price calculation error. Please try again.' 
            });
        }
        
        const user = await User.findById(req.user._id);
        if (user.wallet < totalPrice) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Check for overlapping bookings
        const existingBookings = await Booking.find({
            room: roomId,
            status: { $ne: 'rejected' }, // Exclude rejected bookings
            $or: [
                { 
                    checkInDate: { $lt: checkOut }, 
                    checkOutDate: { $gt: checkIn } 
                }
            ]
        });
        
        if (existingBookings.length > 0) {
            return res.status(400).json({ 
                message: 'This room is already booked for the selected dates' 
            });
        }

        const booking = await Booking.create({
            user: req.user._id,
            room: roomId,
            checkInDate,
            checkOutDate,
            totalPrice
        });

        user.wallet -= totalPrice;
        await user.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('room')
            .sort('-createdAt');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('room')
            .sort('-createdAt');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (status === 'rejected' && booking.status === 'pending') {
            const user = await User.findById(booking.user);
            user.wallet += booking.totalPrice;
            await user.save();
        }

        booking.status = status;
        await booking.save();
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

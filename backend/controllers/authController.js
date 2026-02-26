import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to generate token and set cookie
// const generateTokenAndSetCookie = (res, userId) => {
//     const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
//         expiresIn: '1d',
//     });

//     res.cookie('jwt', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV !== 'development',
//         sameSite: 'strict',
//         maxAge: 1 * 24 * 60 * 60 * 1000,
//     });
// };
const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
        maxAge: 1 * 24 * 60 * 60 * 1000,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            generateTokenAndSetCookie(res, user._id);
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
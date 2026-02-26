import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
];

app.use(cors({
    origin: function (origin, callback) { 
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running smoothly.' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
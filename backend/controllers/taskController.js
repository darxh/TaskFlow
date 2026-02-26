import Task from '../models/Task.js';
import CryptoJS from 'crypto-js';

// --- Helper Functions for Advanced Encryption ---
const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
};

const decryptData = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "Error decrypting content";
    }
};

const decryptTask = (task) => {
    const taskObj = task.toObject ? task.toObject() : { ...task };
    taskObj.description = decryptData(taskObj.description);
    return taskObj;
};

// @desc    Create new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const encryptedDescription = encryptData(description);

        const task = await Task.create({
            user: req.user._id,
            title,
            description: encryptedDescription,
            status: status || 'pending',
        });

        res.status(201).json(decryptTask(task));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user tasks (Handles Pagination, Search & Filters)
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user._id };

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

        const decryptedTasks = tasks.map(decryptTask);

        res.status(200).json({
            tasks: decryptedTasks,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized' });
        }

        const updateData = { ...req.body };
        if (updateData.description) {
            updateData.description = encryptData(updateData.description);
        }

        task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json(decryptTask(task));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized' });
        }

        await task.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
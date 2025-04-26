import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware.js';
import PrintLog from '../models/printLogModel.js';
import User from '../models/userModel.js';
import FileModel from '../models/fileModel.js';

const router = Router();

// Get all print logs (admin only)
router.get('/print-logs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Get query parameters for pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get total count for pagination
        const total = await PrintLog.countDocuments();
        
        // Get print logs with pagination
        const printLogs = await PrintLog.find()
            .sort({ printTimestamp: -1 })
            .skip(skip)
            .limit(limit);
            
        // Get user and file details for each log
        const logsWithDetails = await Promise.all(printLogs.map(async (log) => {
            const user = await User.findById(log.userId).select('name email');
            const file = await FileModel.findById(log.fileId).select('filename path');
            
            return {
                _id: log._id,
                filename: log.filename,
                printTimestamp: log.printTimestamp,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                user: user ? { name: user.name, email: user.email } : 'User not found',
                file: file ? { filename: file.filename, path: file.path } : 'File not found'
            };
        }));
        
        res.status(200).json({
            success: true,
            logs: logsWithDetails,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin print logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching print logs',
            error: error.message
        });
    }
});

// Get print logs for a specific file (admin only)
router.get('/print-logs/file/:fileId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // Get print logs for the file
        const printLogs = await PrintLog.find({ fileId })
            .sort({ printTimestamp: -1 });
            
        // Get user details for each log
        const logsWithDetails = await Promise.all(printLogs.map(async (log) => {
            const user = await User.findById(log.userId).select('name email');
            
            return {
                _id: log._id,
                filename: log.filename,
                printTimestamp: log.printTimestamp,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                user: user ? { name: user.name, email: user.email } : 'User not found'
            };
        }));
        
        res.status(200).json({
            success: true,
            logs: logsWithDetails
        });
    } catch (error) {
        console.error('Admin file print logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching file print logs',
            error: error.message
        });
    }
});

export default router;

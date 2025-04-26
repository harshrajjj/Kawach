import { Router } from 'express';
import FileModel from '../models/fileModel.js';
import PrintLog from '../models/printLogModel.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/:fileId', isAuthenticated, async (req, res) => {
    try {
        const { fileId } = req.params;

        // Fetch file details from MongoDB
        const file = await FileModel.findById(fileId);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        console.log('File Ready to Print');

        // Send file data to frontend
        res.status(200).json({
            success: true,
            file: {
                url: file.path,
                filename: file.filename,
                mimetype: file.mimetype
            }
        });
    } catch (error) {
        console.error('Print route error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing print request'
        });
    }
});

// Log print event
router.post('/log/:fileId', isAuthenticated, async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        // Get IP address and user agent
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Find the file
        const file = await FileModel.findById(fileId);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Create print log
        const printLog = new PrintLog({
            fileId,
            userId,
            filename: file.filename,
            ipAddress,
            userAgent,
            printTimestamp: new Date()
        });

        await printLog.save();

        res.status(200).json({
            success: true,
            message: 'Print event logged successfully'
        });
    } catch (error) {
        console.error('Print log error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging print event'
        });
    }
});

export default router;

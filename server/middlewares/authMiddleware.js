import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// not use (same in down)
// Protected route token based
// export const requireSignIn = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
//         if (!token) {
//             return res.status(401).send('Access denied. No token provided.');
//         }
//         const decode = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decode; // Attach user info to request
//         next();
//     } catch (err) {
//         console.log(err);
//         res.status(400).send('Invalid token.');
//     }
// };

export const isAuthenticated = async (req, res, next) => {
    try {
        // Check for token in cookies first (more secure)
        let token = req.cookies.token;

        // If no token in cookies, check Authorization header as fallback
        // This allows both methods to work during transition
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];  // Bearer <token>
        }

        if (!token) {
            return res.status(401).send('Access denied. No token provided.');
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode; // Attach user info to request (_id)
        next();
    } catch (err) {
        console.log(err);
        res.status(400).send('Invalid token.');
    }
};


// Admin middleware to check if user has admin role
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        next();
    } catch (err) {
        console.error("Error in admin middleware:", err);
        res.status(500).json({
            success: false,
            message: "Error in admin authorization",
            error: err.message
        });
    }
};
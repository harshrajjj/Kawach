import jwt from 'jsonwebtoken'
// import userModel from '../models/userModel.js'

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


//for now no use of it

// export const isAdmin = async (req, res, next) => {
//     try {
//         const user = await userModel.findById(req.user._id);
//         if (user.role !== 1) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized access",
//             });
//         } else {
//             next();
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(401).send({
//             success: false,
//             err,
//             message: "Error in admin middleware",
//         });
//     }
// };
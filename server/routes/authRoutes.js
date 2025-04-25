import express from 'express';
import {
  loginController,
  registerController,
  testController,
  logoutController
} from '../controllers/authController.js';
import {isAuthenticated } from '../middlewares/authMiddleware.js';

 //router object
const router = express.Router();

// Define the registration route
router.post("/register", registerController);

//login|| post
router.post('/login', loginController);

// logout route
router.get('/logout', logoutController);

// test routes
router.get('/test', isAuthenticated, testController);

export default router;

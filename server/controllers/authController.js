import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "./../helper/authHelper.js";
import JWT from "jsonwebtoken";
import express from 'express';

const app = express();
app.use(express.json()); // Parse JSON data

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    //validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
     //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;  // client ma jo axios.post ka sath email password send kiya ha wo req.body ma mil jayga
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    console.log('email',email);
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(404).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    //create token
    //payload: user id
    //secret:  JWT_SECRET from env
    //expiresIn: 2 hours
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Set token in HTTP-only cookie for better security
    // This cookie will be sent with every request but can't be accessed by JavaScript
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    });

    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,   // actual user id
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
      token, // Still send token in response for client-side storage
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};


// test controller
export const testController = (req,res)=>{
    console.log('protected router',req.user)
    res.send("protected route");
}

// logout controller
export const logoutController = (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');

    res.status(200).send({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in logout",
      error
    });
  }
}
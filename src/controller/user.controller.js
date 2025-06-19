import UserRepository from "../repository/user.repository.js";
import { tokenGeneration } from "../config/tokenConfig.js";
import { razorpay } from "../config/razorPay.js";

export default class UserController {
    constructor(){
        this.userRepository = new UserRepository();
    }

    async signUp(req, res){
        try {
            const user = await this.userRepository.signup(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(400).json({ message: error.message });
        }
    }

    async getUserById(req,res){
        try {
            const user = await this.userRepository.getUserById(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }

    async updateUser(req, res){
        try {
            const user = await this.userRepository.updateUser(req.params.id, req.body);
            res.status(200).json(user);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }

    async deleteUser(req, res){
        try {
            const user = await this.userRepository.deleteUser(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }

    async getAllUser(req, res){
        try {
            const users = await this.userRepository.getAllUser();
            res.status(200).json(users);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res){
        try {
            const user = await this.userRepository.login(req.body);
            const token = await tokenGeneration({ id: user._id, email: user.email });
            // Set token in httpOnly cookie
            res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
            res.status(200).json({ user, token });
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(401).json({ message: error.message });
        }
    }

    async logOut(req, res){
        try {
            console.log("Reached Logout")
            res.clearCookie('token', { path: '/', httpOnly: true, sameSite: 'lax' });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(500).json({ message: error.message });
        }
    }

    async createOrder(req, res){
        const { amount } = req.body;

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
    }
}
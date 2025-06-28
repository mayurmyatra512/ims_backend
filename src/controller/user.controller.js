import UserRepository from "../repository/user.repository.js";
import { tokenGeneration } from "../config/tokenConfig.js";
import { razorpay } from "../config/razorPay.js";
import multer from "multer";
import path from "path";

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid image format. Allowed: jpeg, jpg, png, webp, svg"));
        }
    }
});

export { upload };

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
            // Always use companyId from params for multi-tenant logic
            const companyId = req.params.companyId;
            console.log("Company ID from params: ", companyId);
            console.log("User ID from params: ", req.params.id);

            // Defensive: Remove any companyId from req.body to prevent accidental overwrite
            if (req.body.companyId) {
                console.log("Removing companyId from req.body (was: ", req.body.companyId, ")");
                delete req.body.companyId;
            }

            const user = await this.userRepository.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (req.file) {
                const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];
                if (!allowedTypes.includes(req.file.mimetype)) {
                    return res.status(400).json({ message: "Invalid image format. Allowed: jpeg, jpg, png, webp, svg" });
                }
            }

            // Pass only the correct companyId from params
            const updatedUser = await this.userRepository.updateUser(
                req.params.id,
                req.body,
                req.file,
                companyId // always from params
            );
            res.status(200).json(updatedUser);
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
            const users = await this.userRepository.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res){
        try {
            const { email, password } = req.body;
            const user = await this.userRepository.login(email, password);
            console.log("User logged in: ", user);
            // Generate token (if needed)
            const token = await tokenGeneration(user._id, user.companyId);
            // Set token in cookie (httpOnly for security)
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: true, // Uncomment if using HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
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
    async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            // Generate a reset token (could be JWT or random string)
            const token = await this.userRepository.generateResetToken(email);
            // Construct reset URL
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
            // Send email with reset URL (implement sendResetEmail in userRepository or use a mail utility)
            await this.userRepository.sendResetEmail(email, resetUrl);
            res.status(200).json({ message: "Password reset link sent to your email" });
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            // Get token from Authorization header if not in body
            let token = req.body.token;
            if (!token && req.headers.authorization) {
                const authHeader = req.headers.authorization;
                if (authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                } else {
                    token = authHeader;
                }
            }
            const { newPassword } = req.body;
            const user = await this.userRepository.resetPassword(token, newPassword);
            res.status(200).json({ message: "Password reset successfully", user });
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(400).json({ message: error.message });
        }
    }
}
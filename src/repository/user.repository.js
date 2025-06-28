import mongoose from "mongoose";
import UserModel from "../models/user.schema.js";
import { sendPasswordResetEmail } from "../config/transporter.js";

function getMasterDb() {
    // Always use the default mongoose connection for master DB
    return mongoose.connection;
}

export default class UserRepository {
    getUserModel() {
        const masterDb = getMasterDb();
        if (!masterDb.modelNames().includes('users')) {
            masterDb.model('users', UserModel.schema);
        }
        return masterDb.model('users');
    }

    async signup(userData) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        const user = new UserModel(userData);
        await user.save();
        return user;
    }

    async getUserById(userId) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        const user = await UserModel.findById(userId);
        if (!user) throw new Error(`User with ID ${userId} not found`);
        return user;
    }

    async updateUser(userId, userData, file, companyId) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        let updateObj = { ...userData, updatedAt: new Date() };
        // If file is present, save its path (multer diskStorage)
        if (file && file.path) {
            // Save relative path for serving via static
            updateObj.profileImage = `/user_images/${companyId}/${file.filename}`;
        }
        const user = await UserModel.findByIdAndUpdate(
            userId,
            updateObj,
            { new: true, runValidators: true }
        );
        if (!user) throw new Error(`User with ID ${userId} not found`);
        return user;
    }

    async deleteUser(userId) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        const user = await UserModel.findByIdAndDelete(userId);
        if (!user) throw new Error(`User with ID ${userId} not found`);
        return user;
    }

    async getAllUsers() {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        return await UserModel.find();
    }

    async login(email, password) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        // Populate companyId and bankId (from company)
        const user = await UserModel.findOne({ email })
            .select('+password')
            .populate({
                path: 'companyId',
                populate: { path: 'bankId' }
            });
            console.log("User found:", user);
        if (!user) throw new Error("Invalid email or password");
        const isMatch = await user.correctPassword(password, user.password);
        if (!isMatch) throw new Error("Invalid email or password");
        return user;
    }
    
    async forgetPassword(email) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found with this email");
        // Generate a reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        // Return the reset token
        return resetToken;
    }

    async resetPassword(resetToken, newPassword) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        // Find user by reset token
        const user = await UserModel.findOne({ passwordResetToken: resetToken, passwordResetExpires: { $gt: Date.now() } });
        if (!user) throw new Error("Invalid or expired reset token");
        // Set new password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return user;
    }

    async sendResetEmail(email, resetUrl) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found with this email");
        // Here you would implement the logic to send the reset email
        console.log(`Reset email sent to ${email} with reset URL: ${resetUrl}`);
        // For example, using a mail service like Nodemailer or SendGrid
        
        const subject = "Password Reset Link - Invoice Management System";
        const htmlContent = `<p>Click the link below to reset your password:</p>
                             <p><a href="${resetUrl}">${resetUrl}</a></p>`;
        await sendPasswordResetEmail(email, subject, htmlContent);
        return { message: "Password reset email sent successfully" };
    }
}
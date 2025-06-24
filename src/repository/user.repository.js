import mongoose from "mongoose";
import UserModel from "../models/user.schema.js";

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

    async updateUser(userId, userData) {
        const UserModel = this.getUserModel();
        if (!UserModel) throw new Error("User collection not found in master DB");
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { ...userData, updatedAt: new Date() },
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
    
}
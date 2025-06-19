
import UserModel from "../models/user.schema.js";

export default class UserRepository {
    async signup(userData) {
        try {
            const user = new UserModel(userData);
            console.log("User Data = ", user);
            await user.save();
            return user;
        } catch (error) {
            console.log("Error in Repository = ", error);
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async getUserById(userId) {
        try {
            const user = await UserModel.findById(userId)
            if (!user) {
                throw new Error(`Service with ID ${userId} not found`);
            }
            return user;
        } catch (error) {
            console.log("Error in Repository = ", error);
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    async updateUser(userId, userData) {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { ...userData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            return user;
        } catch (error) {
            console.log("Error in Repository = ", error);
            throw new Error(`Error updating User: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            const user = await UserModel.findByIdAndDelete(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            return user;
        } catch (error) {
            console.log("Error in Repository = ", error);
            throw new Error(`Error deleting User: ${error.message}`);
        }
    }

    async getAllUser() {
        try {
            const user = await UserModel.find();
            return user;
        } catch (error) {
            console.log("Error in Repository = ", error);
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    async login(userData) {
        try {
            // Find user by email and include password field
            const user = await UserModel.findOne({ email: userData.email }).select('+password');
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check subscription type and expiry
            if (user.subscriptionType !== 'trial' && user.subscriptionType !== 'paid') {
                throw new Error('Invalid subscription type.');
            }
            if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
                throw new Error('Subscription expired. Please renew to continue.');
            }

            // Check password
            const isMatch = await user.correctPassword(userData.password, user.password);
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }
            // Remove password from result
            user.password = undefined;
            return user;
        } catch (error) {
            console.log("Error in Repository = ", error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }

}
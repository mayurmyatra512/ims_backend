import mongoose, { mongo } from "mongoose";

const bankSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: [true, "Please select a company"],
    },
    bankName: {
        type: String,
        required: [true, "Please enter the bank name"],
        trim: true,
    },
    accountNumber: {
        type: String,
        required: [true, "Please enter the account number"],
        unique: true,
    },
    ifscCode: {
        type: String,
        required: [true, "Please enter the IFSC code"],
    },
    branchName: {
        type: String,
        required: [true, "Please enter the branch name"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

const BankModel = mongoose.model("Bank", bankSchema, "mainCollection");
export default BankModel;
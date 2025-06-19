import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        trim: true,
        required: [true, "Please enter your company name"],
    },
    description: {
        type: String,
         required: [true, "Please enter your description of your work in single line"],
    },
    address: {
        type: String,
        required: [true, "Please enter your address"],
    },
    subscriptionType: {
        type: String,
        enum: ["trial", "paid", "expired"],
        default: "trial",
    },
    subscriptionStart: {
        type: Date,
        default: Date.now,
    },
    subscriptionExpiry: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        },
    },

    maxEmailsAllowed: {
        type: Number,
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bank",
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
const CompanyModel = mongoose.model("Company", companySchema);
export default CompanyModel;
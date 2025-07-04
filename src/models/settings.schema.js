import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Please select a company"],
        },
    companyType: {
        type: String,
        enum: ["RTO Service", "Service", "Items", "Both"],
        default: "RTO Service"
    },
    companyTax: {
        type: String,
        enum: ["GST", "Non GST"],
        default: ["Non GST"],
    },
    currency: {
        type: String, 
    },
    IGST: {
        type: Number,
        required: function () {
            return this.companyTax === "GST";
        },
    },
    CGST: {
        type: Number,
        required: function () {
            return this.companyTax === "GST";
        },
    },
    SGST: {
        type: Number,
        required: function () {
            return this.companyTax === "GST";
        },
    }
});

const SettingModel = mongoose.model("Setting", settingSchema, "settings");
export default SettingModel;
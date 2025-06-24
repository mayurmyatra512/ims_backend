import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: [true, "Please enter the invoice number"],
        unique: true,
        trim: true,
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party",
        required: [true, "Please select a party"],
    },
    services: [
        {
            vehicleNum: {
                type: String,
                required: [true, "Please provide Vehicle Number for the service"],
            },
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
                required: true,
            },
            amount: {
                type: Number,
                required: [true, "Please provide amount for the service"],
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    invoiceDate: {
        type: Date,
        required: [true, "Please enter the invoice date"],
        default: Date.now,
    },
    paidAmount: {
        type: Number,
        required: [true, "Please enter the paid amount"],
        default: 0,
    },
    pendingAmount: {
        type: Number,
        required: [true, "Please enter the pending amount"],
        default: 0,
    },
    mobile:{
        type: Number,
        required: [true, "Please enter the mobile number"],
        trim: true,
    },

    status: {
        type: String,
        enum: ["Pending", "Paid", "Cancelled"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide the user who created the invoice"],
    },
});

// Calculate totalAmount before saving or updating
invoiceSchema.pre("save", function (next) {
    this.totalAmount = this.services.reduce((sum, s) => sum + s.amount, 0);
    this.updatedAt = new Date();
    next();
});

invoiceSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.services) {
        update.totalAmount = update.services.reduce((sum, s) => sum + s.amount, 0);
    }
    update.updatedAt = new Date();
    this.setUpdate(update);
    next();
});

invoiceSchema.pre("updateMany", function (next) {
    const update = this.getUpdate();
    if (update.services) {
        update.totalAmount = update.services.reduce((sum, s) => sum + s.amount, 0);
    }
    update.updatedAt = new Date();
    this.setUpdate(update);
    next();
});


// Ensure that the invoiceNumber is unique
const InvoiceModel = mongoose.model("Invoice", invoiceSchema, "invoices");
export default InvoiceModel;
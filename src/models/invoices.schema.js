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
    items: [
        {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
                min: 0,
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
// Conditional validation
invoiceSchema.pre("validate", async function (next) {
      try {
        const invoice = this;

        // Fetch the user and their associated company
        const user = await mongoose.model("User").findById(invoice.createdBy).populate("companyId");

        if (!user || !user.companyId || !user.companyId.type) {
            return next(new Error("Unable to determine company type"));
        }

        const companyType = user.companyId.type; // "Service", "Items", "Both", etc.

        if ((companyType === "RTO Service" || companyType === "Service") && (!invoice.services || invoice.services.length === 0)) {
            invoice.invalidate("services", "Services are required for this company type.");
        }

        if (companyType === "Items" && (!invoice.items || invoice.items.length === 0)) {
            invoice.invalidate("items", "Items are required for this company type.");
        }

        if (companyType === "Both") {
            if (!invoice.services || invoice.services.length === 0) {
                invoice.invalidate("services", "Services are required when company type is Both.");
            }
            if (!invoice.items || invoice.items.length === 0) {
                invoice.invalidate("items", "Items are required when company type is Both.");
            }
        }

        next();
    } catch (error) {
        console.error("Validation Error:", error);
        next(error);
    }
});

// Calculate totalAmount before saving or updating
invoiceSchema.pre("save", function (next) {
     const servicesTotal = (this.services || []).reduce((sum, s) => sum + s.amount, 0);
    const itemsTotal = (this.items || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);
    this.totalAmount = servicesTotal + itemsTotal;

    this.updatedAt = new Date();
    next();
});

invoiceSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.services || update.items) {
       const servicesTotal = (update.services || []).reduce((sum, s) => sum + s.amount, 0);
        const itemsTotal = (update.items || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);
        update.totalAmount = servicesTotal + itemsTotal;
    }
    update.updatedAt = new Date();
    this.setUpdate(update);
    next();
});

invoiceSchema.pre("updateMany", function (next) {
    const update = this.getUpdate();
    if (update.services || update.items) {
       const servicesTotal = (update.services || []).reduce((sum, s) => sum + s.amount, 0);
        const itemsTotal = (update.items || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);
        update.totalAmount = servicesTotal + itemsTotal;
    }
    update.updatedAt = new Date();
    this.setUpdate(update);
    next();
});


// Ensure that the invoiceNumber is unique
const InvoiceModel = mongoose.model("Invoice", invoiceSchema, "invoices");
export default InvoiceModel;
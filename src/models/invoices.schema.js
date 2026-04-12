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
        ref:  "Party",
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
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: true,
                trim: true,
            },
            itemQuantity: {
                type: Number,
                required: true,
                min: 1,
            },
            itemPrice: {
                type: Number,
                required: true,
                min: 0,
            },
            total: {
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
    mobile: {
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
            const hasServices = invoice.services && invoice.services.length > 0;
            const hasItems = invoice.items && invoice.items.length > 0;
            if (!hasServices && !hasItems) {
                const message = "At least one service or item is required when company type is Both.";
                invoice.invalidate("services", message);
                invoice.invalidate("items", message);
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
    let servicesTotal = (this.services || []).reduce((sum, s) => sum + s.amount, 0);
    let itemsTotal = (this.items || []).reduce((sum, i) => sum + (i.itemPrice * i.itemQuantity), 0);
    console.log("Calculating totalAmount - Services Total:", servicesTotal, "Items Total:", itemsTotal);
    servicesTotal = isNaN(Number(servicesTotal)) ? 0 : Number(servicesTotal)
    itemsTotal = isNaN(Number(itemsTotal)) ? 0 : Number(itemsTotal)
    this.totalAmount = servicesTotal + itemsTotal;

    this.updatedAt = new Date();
    next();
});

invoiceSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.services || update.items) {
        let servicesTotal = (update.services || []).reduce((sum, s) => sum + s.amount, 0);
        console.log("ServiceTotal :", servicesTotal);
        let itemsTotal = (update.items || []).reduce((sum, i) => sum + (i.itemPrice * i.itemQuantity), 0);
        servicesTotal = isNaN(Number(servicesTotal)) ? 0 : Number(servicesTotal)
        itemsTotal = isNaN(Number(itemsTotal)) ? 0 : Number(itemsTotal)
        // console.log("itemsTotal :", isNaN(Number(itemsTotal)) ? 0 : Number(itemsTotal));
        update.totalAmount = servicesTotal + itemsTotal;
    }
    update.updatedAt = new Date();
    this.setUpdate(update);
    next();
});

invoiceSchema.pre("updateMany", function (next) {
    const update = this.getUpdate();
    if (update.services || update.items) {
        let servicesTotal = (update.services || []).reduce((sum, s) => sum + s.amount, 0);
        let itemsTotal = (update.items || []).reduce((sum, i) => sum + (i.itemPrice * i.itemQuantity), 0);
        servicesTotal = isNaN(Number(servicesTotal)) ? 0 : Number(servicesTotal)
        itemsTotal = isNaN(Number(itemsTotal)) ? 0 : Number(itemsTotal)
        update.totalAmount = servicesTotal + itemsTotal;
    }
    update.updatedAt = new Date();
    this.setUpdate(update);
    next();
});

// invoiceSchema.post("findById", async function (doc, next) {
//     if (doc.items && doc.items.length > 0) {
//         const Item = mongoose.model("Item");
//         for (const item of doc.items) {
//             if (item.itemId) {
//                 const itemData = await Item.findById(item.itemId).select("name");
//                 if (itemData) {
//                     item.name = itemData.name;
//                 }
//             }
//         }
//     }
//     next();
// });




// Ensure that the invoiceNumber is unique
const InvoiceModel = mongoose.model("Invoice", invoiceSchema, "invoices");
export default InvoiceModel;
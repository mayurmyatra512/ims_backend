import mongoose from "mongoose";
// import documents from "razorpay/dist/types/documents";
// import qrCode from "razorpay/dist/types/qrCode";

// const itemSchema = new mongoose.Schema({
//     itemName: {
//         type: String,
//         required: [true, "Please enter the item name"],
//         trim: true,
//     },
//     itemCode: {
//         type: String,
//         required: [true, "Please enter the item code"],
//         unique: true,
//         trim: true,
//     },
//     description: {
//         type: String,
//         // required: [true, "Please enter a description for the item"],
//     },
//     unit: {
//         type: String,
//         required: [true, "Please enter the item unit"],
//         enum: ["kg", "g", "ltr", "pcs", "mtr", "cm", "mm"],
//     },
//     price: {
//         type: Number,
//         required: [true, "Please enter the item price"],
//         min: [0, "Price cannot be negative"],
//     },
//     stockQuantity: {
//         type: Number,
//         required: [true, "Please enter the stock quantity"],
//         min: [0, "Stock quantity cannot be negative"],
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

const itemSchema = new mongoose.Schema({
    // Basic item information
    productCode: {
        type: String,
        required: [true, "Please enter the product code"],
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, "Please enter the item name"],
        trim: true,
    },
    description: {
        type: String,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        // required: [true, "Please enter the category ID"],
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
        // required: [true, "Please enter the subcategory ID"],
    },
    tags: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ["active", "inactive", "discontinued"],
        default: "active",
    },

    // Pricing related fields
    basePrice: {
        type: Number,
        // required: [true, "Please enter the base price"],
        min: [0, "Base price cannot be negative"],
    },
    currency: {
        type: String,
        // required: [true, "Please enter the currency"],
        enum: ["USD", "EUR", "GBP", "INR", "JPY"],
        default: "USD",
    },
    costPrice: {
        type: Number,
        // required: [true, "Please enter the cost price"],
        min: [0, "Cost price cannot be negative"],
    },
    taxRate: {
        type: Number,
        default: 0,
        min: [0, "Tax rate cannot be negative"],
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
    },
    priceTiers: [{
        tierName: {
            type: String,
            // required: [true, "Please enter the tier name"],
        },
        minQuantity: {
            type: Number,
            // required: [true, "Please enter the minimum quantity for the tier"],
            min: [1, "Minimum quantity must be at least 1"],
        },
        price: {
            type: Number,
            // required: [true, "Please enter the price for the tier"],
            min: [0, "Price cannot be negative"],
        },
    }],
    mrp: {
        type: Number,
        required: [true, "Please enter the MRP"],
        min: [0, "MRP cannot be negative"],
    },
    sku: {
        type: String,
        // required: [true, "Please enter the SKU"],
        unique: true,
        trim: true,
    },
    // Inventory related fields
    stockQuantity: {
        type: Number,
        required: [true, "Please enter the stock quantity"],
        min: [0, "Stock quantity cannot be negative"],
    },
    reorderLevel: {
        type: Number,
        default: 0,
        min: [0, "Reorder level cannot be negative"],
    },
    reorderQuantity: {
        type: Number,
        default: 0,
        min: [0, "Reorder quantity cannot be negative"],
    },
    unitOfMeasure: {
        type: String,
        required: [true, "Please enter the unit of measure"],
        default: "pcs",
        enum: ["kg", "g", "ltr", "pcs", "mtr", "cm", "mm"],
    },
    warehouseLocation: [
        {
            type: String,
            required: [true, "Please enter the warehouse location"],
        }
    ],
    batchTracking: {
        enabled: {
            type: Boolean,
            default: false,
        },
        batchNumber: {
            type: String,
            trim: true,
        },
        expiryDate: {
            type: Date,
        },
    },
    serialTracking: {
        enabled: {
            type: Boolean,
            default: false,
        },
        serialNumbers: [{
            type: String,
            trim: true,
        }],
    },

    // Supplier related fields
    primarySupplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        // required: [true, "Please enter the primary supplier ID"],
    },
    supplierList: [{
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
        },
        supplierName: {
            type: String,
            // required: [true, "Please enter the supplier name"],
        },
        contactInfo: {
            type: String,
            // required: [true, "Please enter the contact information"],
        },
    }],
    leadTime: {
        type: Number,
        default: 0,
        min: [0, "Lead time cannot be negative"],
    },

    // Bill of Materials (BOM) related fields
    // bomId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "BOM",
    //     // required: [true, "Please enter the BOM ID"],
    // },
    // productionCost: {
    //     type: Number,
    //     default: 0,
    //     min: [0, "Production cost cannot be negative"],
    // },
    // manufacturingTime: {
    //     type: Number,
    //     default: 0,
    //     min: [0, "Manufacturing time cannot be negative"],
    // },

    // Images related fields
    images: [{
        url: {
            type: String,
            // required: [true, "Please enter the image URL"],
        },
        altText: {
            type: String,
            trim: true,
        },
    }],
    documents: [{
        documentType: {
            type: String,
            // required: [true, "Please enter the document type"],
        },
        url: {
            type: String,
            // required: [true, "Please enter the document URL"],
        },
        description: {
            type: String,
            trim: true,
        },
    }],
    barcode: {
        type: String,
        unique: true,
        trim: true,
        // required: [true, "Please enter the barcode"],
    },
    qrCode: {
        type: String,
        unique: true,
        trim: true,
        // required: [true, "Please enter the QR code"],
    },

    // User information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Please enter the creator's user ID"],
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Please enter the updater's user ID"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    customFields: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomField",
        default: {},
    },
});

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the category name"],
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Please enter the category code"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        // required: [true, "Please enter the category description"],
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        // required: [true, "Please enter the parent category ID"],
    },
    level: {
        type: Number,
        required: [true, "Please enter the category level"],
        min: [0, "Category level cannot be negative"],
    },
    status: {
        type: String,
        required: [true, "Please enter the category status"],
        enum: ["active", "inactive"],
        default: "active",
    },
    tags: {
        type: [String],
        default: [],
    },
    sooslug: {
        type: String,
        required: [true, "Please enter the category slug"],
        unique: true,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Please enter the creator's user ID"],
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Please enter the updater's user ID"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the subcategory name"],
        trim: true,
    },
    code: {
        type: String,
        unique: true,
        trim: true
    },
    description: { 
        type: String 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    status: { 
        type: String,
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    image: { 
        type: String 
    },
    seoSlug: { 
        type: String, trim: true 
    },
    tags: [{ 
        type: String 
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    },
    createdAt: { 
        type: Date, default: Date.now 
    },
    updatedAt: { 
        type: Date, default: Date.now 
    },
    isDeleted: { 
        type: Boolean, default: false 
    },
    customFields: { 
        type: mongoose.Schema.Types.Mixed 
    }
});

const SubcategoryModel = mongoose.model('Subcategory', subcategorySchema, 'subcategories');
const CategoryModel = mongoose.model("Category", categorySchema, 'categories');
const ItemModel = mongoose.model("Item", itemSchema, "items");

export { ItemModel, CategoryModel, SubcategoryModel };

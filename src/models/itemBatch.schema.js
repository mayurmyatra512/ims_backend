import mongoose from "mongoose";

/**
 * =============================================
 * ITEM BATCH MODEL
 * =============================================
 * Each batch belongs to a single Item.
 * It represents a production or purchase lot (e.g., 50 keyboards in one batch).
 */
const itemBatchSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID is required"],
    },
    batchNumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
    },
    packageDate: {
      type: Date,
      required: [true, "Package date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    // Stock Information
    totalQty: {
      type: Number,
      required: [true, "Total quantity is required"],
      min: [0, "Total quantity cannot be negative"],
    },
    availableQty: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Available quantity cannot be negative"],
    },

    // Serial numbers for this batch
    serialNumbers: [
      {
        type: String,
        trim: true,
        unique: false, // uniqueness handled per batch, not globally
      },
    ],

    // Status and tracking
    status: {
      type: String,
      enum: ["active", "sold_out", "expired", "damaged"],
      default: "active",
    },
    location: {
      type: String,
      trim: true,
    },

    // Supplier Info
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const ItemBatchModel = mongoose.model("ItemBatch", itemBatchSchema, "item_batches");

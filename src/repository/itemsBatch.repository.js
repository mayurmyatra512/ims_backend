import { ItemBatchModel } from "../models/itemBatch.schema.js";
import mongoose from "mongoose";
/**
 * =============================================
 * ITEM BATCH REPOSITORY
 * =============================================
 * Handles all database operations related to Item Batches.
 * Each batch belongs to a single item, with its own serial numbers, qty, etc.
 */
function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}


export class ItemBatchRepository {
    static getItemBatchModel(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb) throw new Error("Company database not found");
        // Register the model if not already registered
        if (!companyDb.modelNames().includes('ItemBatch')) {
          companyDb.model('ItemBatch', ItemBatchModel.schema, 'item_batches');
        }
        return companyDb.model('ItemBatch');
      }

 
  /**
   * Create a new batch for an item
   */
  static async createBatch(companyId, companyName,data) {
    try {
      const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      const batch = new ItemBatchModel(data);
      return await batch.save();
    } catch (error) {
      console.error("❌ Error creating batch:", error);
      throw error;
    }
  }

  /**
   * Fetch all batches (optionally filtered by itemId, supplierId, status, etc.)
   */
  static async getAllBatches(companyId, companyName, filter = {}, options = {}) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      return await ItemBatchModel.find(filter, null, options)
        .populate("itemId", "name itemCode brand category")
        .populate("supplierId", "name contactNumber email")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("❌ Error fetching batches:", error);
      throw error;
    }
  }

  /**
   * Fetch a single batch by ID
   */
  static async getBatchById(companyId, companyName, batchId) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      return await ItemBatchModel.findById(batchId)
        .populate("itemId", "name itemCode brand category")
        .populate("supplierId", "name contactNumber email")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");
    } catch (error) {
      console.error("❌ Error fetching batch by ID:", error);
      throw error;
    }
  }

  /**
   * Update a batch by ID
   */
  static async updateBatch(companyId, companyName, batchId, updateData) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      return await ItemBatchModel.findByIdAndUpdate(batchId, updateData, { new: true });
    } catch (error) {
      console.error("❌ Error updating batch:", error);
      throw error;
    }
  }

  /**
   * Delete (physically remove) a batch
   */
  static async deleteBatch(companyId, companyName, batchId) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      return await ItemBatchModel.findByIdAndDelete(batchId);
    } catch (error) {
      console.error("❌ Error deleting batch:", error);
      throw error;
    }
  }

  /**
   * Adjust available quantity in a batch
   * @param {String} batchId
   * @param {Number} qtyChange - can be positive (restock) or negative (sale)
   */
  static async adjustBatchStock(companyId, companyName, batchId, qtyChange) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      const batch = await ItemBatchModel.findById(batchId);
      if (!batch) throw new Error("Batch not found");

      batch.availableQty += qtyChange;
      if (batch.availableQty < 0) batch.availableQty = 0;

      // Auto update status
      if (batch.availableQty === 0) batch.status = "sold_out";

      return await batch.save();
    } catch (error) {
      console.error("❌ Error adjusting batch stock:", error);
      throw error;
    }
  }

  /**
   * Add new serial numbers to a batch
   * (Validates duplicates within the same batch)
   */
  static async addSerialNumbers(companyId, companyName,batchId, serialNumbers = []) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      const batch = await ItemBatchModel.findById(batchId);
      if (!batch) throw new Error("Batch not found");

      const existingSet = new Set(batch.serialNumbers);
      const newSerials = serialNumbers.filter(sn => !existingSet.has(sn));

      if (newSerials.length === 0) return batch;

      batch.serialNumbers.push(...newSerials);
      batch.totalQty += newSerials.length;
      batch.availableQty += newSerials.length;

      return await batch.save();
    } catch (error) {
      console.error("❌ Error adding serial numbers:", error);
      throw error;
    }
  }

  /**
   * Remove serial numbers from a batch
   */
  static async removeSerialNumbers(companyId, companyName,batchId, serialNumbers = []) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      const batch = await ItemBatchModel.findById(batchId);
      if (!batch) throw new Error("Batch not found");

      const beforeCount = batch.serialNumbers.length;
      batch.serialNumbers = batch.serialNumbers.filter(sn => !serialNumbers.includes(sn));

      const removedCount = beforeCount - batch.serialNumbers.length;
      batch.availableQty = Math.max(0, batch.availableQty - removedCount);
      batch.totalQty = Math.max(0, batch.totalQty - removedCount);

      return await batch.save();
    } catch (error) {
      console.error("❌ Error removing serial numbers:", error);
      throw error;
    }
  }

  /**
   * Mark batch as expired or damaged (automatic or manual)
   */
  static async updateBatchStatus(companyId, companyName, batchId, status) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      const validStatuses = ["active", "sold_out", "expired", "damaged"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid batch status");
      }

      return await ItemBatchModel.findByIdAndUpdate(
        batchId,
        { status },
        { new: true }
      );
    } catch (error) {
      console.error("❌ Error updating batch status:", error);
      throw error;
    }
  }

  /**
   * Auto-expire batches based on expiryDate
   */
  static async expireOldBatches(companyId, companyName,) {
    try {
        const ItemBatchModel = this.getItemBatchModel(companyId, companyName);
      if (!ItemBatchModel) throw new Error("ItemBatch collection not found for this company");
      const now = new Date();
      const result = await ItemBatchModel.updateMany(
        { expiryDate: { $lt: now }, status: { $ne: "expired" } },
        { $set: { status: "expired" } }
      );
      return result;
    } catch (error) {
      console.error("❌ Error expiring old batches:", error);
      throw error;
    }
  }
}

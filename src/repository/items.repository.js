import mongoose from "mongoose";
import { ItemModel } from "../models/items.schema.js";


function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class ItemRepository {
  static getItemModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Item')) {
      companyDb.model('Item', ItemModel.schema, 'items');
    }
    return companyDb.model('Item');
  }

  static async createItem(companyId, companyName, itemData) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const item = new ItemModel(itemData);
    return await item.save();
  }

  static async getItemById(companyId, companyName, itemId) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    return await ItemModel.findById(itemId).populate("categoryId", "name").populate("subcategoryId", "name");
  }

  static async updateItem(companyId, companyName, itemId, itemData) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const item = await ItemModel.findByIdAndUpdate(
      itemId,
      { ...itemData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) throw new Error(`Item with ID ${itemId} not found`);
    return item;
  }

  static async deleteItem(companyId, companyName, itemId) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const item = await ItemModel.findByIdAndUpdate(itemId, { isDeleted: true }, { new: true });
    if (!item) throw new Error(`Item with ID ${itemId} not found`);
    return item;
  }

  static async getAllItems(companyId, companyName, filter = {}) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    return await ItemModel.find(filter).populate("categoryId", "name")
      .populate("subcategoryId", "name");
  }

  static async getItemByName(companyId, companyName, itemName) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    // Use regex to find item by name (case-insensitive)
    return await ItemModel.findOne({
      name: { $regex: `^${itemName.trim()}$`, $options: "i" }
    })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .populate({ path: 'supplier', select: 'name contactInfo email phone' });
  }

}
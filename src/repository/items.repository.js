import mongoose from "mongoose";
import { ItemModel } from "../models/items.schema.js";


function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class ItemRepository {
  static getItemModel(companyId, companyName) {
    console.log(`Getting item model for company ${companyId}/${companyName}`);
    console.log(`ItemModel available:`, !!ItemModel);
    console.log(`ItemModel.schema available:`, !!(ItemModel && ItemModel.schema));
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    console.log(`Company DB:`, companyDb.name);
    console.log(`Model names in DB:`, companyDb.modelNames());
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Item')) {
      console.log(`Registering Item model in company DB`);
      companyDb.model('Item', ItemModel.schema, 'items');
      console.log(`Item model registered, new model names:`, companyDb.modelNames());
    }
    const model = companyDb.model('Item');
    console.log(`Returning Item model:`, !!model);
    return model;
  }

  static async createItem(companyId, companyName, data) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    return await ItemModel.create(data);
  }

  static async getAllItems(companyId, companyName, filters = {}, populate = false) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const query = ItemModel.find(filters).sort({ createdAt: -1 });
    if (populate) {
      query
        .populate("category", "name code")
        .populate("brand", "name")
        .populate("supplierId", "name");
    }
    return await query.exec();
  }

  static async getItemById(companyId, companyName, id, populate = false) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const query = ItemModel.findById(id);
    if (populate) {
      query
        .populate("category", "name code")
        .populate("brand", "name")
        .populate("supplierId", "name");
    }
    return await query.exec();
  }

  static async getItemByCode(companyId, companyName, itemCode) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    return await ItemModel.findOne({ itemCode });
  }

  static async updateItem(companyId, companyName, id, updateData) {
    console.log("Updating item with data:", { companyId, companyName, id, updateData });
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    return await ItemModel.findByIdAndUpdate(id, updateData, {
      runValidators: true,
    });
  }

  static async deleteItem(companyId, companyName, id, softDelete = true) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    if (softDelete) {
      return await ItemModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
    return await ItemModel.findByIdAndDelete(id);
  }

  static async adjustStock(companyId, companyName, itemId, qtyChange) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const item = await ItemModel.findById(itemId);
    if (!item) throw new Error("Item not found");
    item.availableQty = Math.max(0, item.availableQty + qtyChange);
    return await item.save();
  }

  static async getItemByName(companyId, companyName, itemName) {
    console.log(`Searching for item "${itemName}" in company ${companyId}/${companyName}`);
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    const item = await ItemModel.findOne({ name: itemName });
    console.log("Item found:", item);
    if (!item) {
      // Let's also try searching case-insensitively
      const caseInsensitiveItem = await ItemModel.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
      console.log("Case-insensitive search result:", caseInsensitiveItem);
      if (caseInsensitiveItem) {
        console.log("Found item with different case, using it");
        return caseInsensitiveItem;
      }
      throw new Error(`Item with name ${itemName} not found`);
    }
    return item;
  }

  static async getItemsByIds(companyId, companyName, itemIds) {
    const ItemModel = this.getItemModel(companyId, companyName);
    if (!ItemModel) throw new Error("Item collection not found for this company");
    return await ItemModel.find({ _id: { $in: itemIds } });
  }
}



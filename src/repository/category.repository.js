import mongoose from "mongoose";
import {CategoryModel} from "../models/items.schema.js";
// import { Category } from ".js";

function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName
    ? companyName.toLowerCase().replace(/\s+/g, "")
    : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class CategoryRepository {
  static getCategoryModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");

    if (!companyDb.modelNames().includes("Category")) {
      companyDb.model("Category", CategoryModel.schema, "categories");
    }
    return companyDb.model("Category");
  }

  static async createCategory(companyId, companyName, data) {
    const Model = this.getCategoryModel(companyId, companyName);
    const doc = new Model(data);
    return await doc.save();
  }

  static async getByCategoryId(companyId, companyName, id) {
    return await this.getCategoryModel(companyId, companyName)
      .findById(id)
      .populate("parentId", "name");
  }

  static async getAllCategories(companyId, companyName, filter = {}) {
    return await this.getCategoryModel(companyId, companyName)
      .find(filter)
      .populate("parentId", "name");
  }

  static async updateCategory(companyId, companyName, id, data) {
    return await this.getCategoryModel(companyId, companyName).findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  static async deleteCategory(companyId, companyName, id) {
    return await this.getCategoryModel(companyId, companyName).findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}

import mongoose from "mongoose";
import {SubcategoryModel} from "../models/items.schema.js";


function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName
    ? companyName.toLowerCase().replace(/\s+/g, "")
    : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class SubcategoryRepository {
  static getSubcategoryModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");

    if (!companyDb.modelNames().includes("Subcategory")) {
      companyDb.model("Subcategory", SubcategoryModel.schema, "subcategories");
    }
    return companyDb.model("Subcategory");
  }

  static async createSubcategory(companyId, companyName, data) {
    const Model = this.getSubcategoryModel(companyId, companyName);
    const doc = new Model(data);
    return await doc.save();
  }

  static async getBySubcategoryId(companyId, companyName, id) {
    return await this.getSubcategoryModel(companyId, companyName)
      .findById(id)
      .populate("categoryId", "name");
  }

  static async getAllSubcategories(companyId, companyName, filter = {}) {
    return await this.getSubcategoryModel(companyId, companyName)
      .find(filter)
      .populate("categoryId", "name");
  }

  static async updateSubcategory(companyId, companyName, id, data) {
    return await this.getSubcategoryModel(companyId, companyName).findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  static async deleteSubcategory(companyId, companyName, id) {
    return await this.getSubcategoryModel(companyId, companyName).findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}

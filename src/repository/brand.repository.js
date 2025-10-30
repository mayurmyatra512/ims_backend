import mongoose from "mongoose";
import {BrandModel} from "../models/items.schema.js";

function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName
    ? companyName.toLowerCase().replace(/\s+/g, "")
    : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class BrandRepository {
  static getBrandModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");

    if (!companyDb.modelNames().includes("Brand")) {
      companyDb.model("Brand", BrandModel.schema, "brands");
    }
    return companyDb.model("Brand");
  }

  static async createBrand(companyId, companyName, data) {
    const Model = this.getBrandModel(companyId, companyName);
    const doc = new Model(data);
    return await doc.save();
  }

  static async getByBrandId(companyId, companyName, id) {
    return await this.getBrandModel(companyId, companyName)
      .findById(id)
      .populate("parentId", "name");
  }

  static async getAllBrands(companyId, companyName, filter = {}) {
    return await this.getBrandModel(companyId, companyName)
      .find(filter)
      .populate("parentId", "name");
  }

  static async updateBrand(companyId, companyName, id, data) {
    return await this.getBrandModel(companyId, companyName).findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  static async deleteBrand(companyId, companyName, id) {
    return await this.getBrandModel(companyId, companyName).findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}

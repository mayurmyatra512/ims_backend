import mongoose from "mongoose";
import CompanyModel from "../models/company.schema.js";
import { getCompanyModel } from "../config/tenantManager.js";
import { ObjectId } from "mongodb";
import { safeObjectId } from "./invoices.repository.js";
import e from "express";

export default class CompanyRepository {
  async createCompany(companyData) {
    try {
      const company = new CompanyModel(companyData);
      await company.save();
      return company;
    } catch (error) {
      console.log("Error in Repository: ", error);
      throw new Error(`Error creating company: ${error.message}`);
    }
  }

  async getCompanyById(companyId) {
    try {
      // Defensive: Only query if companyId is a valid ObjectId string
      if (typeof companyId !== "string" || companyId.length !== 24 || !/^[a-fA-F0-9]+$/.test(companyId)) {
        // Instead of throwing, just return null so upstream can handle gracefully
        return null;
      }
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }
      return company;
    } catch (error) {
      console.log(error);
      throw new Error(`Error fetching company: ${error.message}`);
    }
  }

  async updateCompany(companyId, companyData) {
    try {
      const company = await CompanyModel.findByIdAndUpdate(
        companyId,
        { ...companyData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }
      return company;
    } catch (error) {
      throw new Error(`Error updating company: ${error.message}`);
    }
  }

  async deleteCompany(companyId) {
    try {
      const company = await CompanyModel.findByIdAndDelete(companyId);
      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }
      return company;
    } catch (error) {
      throw new Error(`Error deleting company: ${error.message}`);
    }
  }

  async getAllCompanies() {
    try {
      const companies = await CompanyModel.find();
      return companies;
    } catch (error) {
      throw new Error(`Error fetching companies: ${error.message}`);
    }
  }

  // Get an existing collection/model for a company (do not create new)
  getCompanyCollection(companyId, type) {
    const companyDb = mongoose.connection.useDb(`rkautoadviser_${companyId}`);
    return companyDb.modelNames().includes(`${type}_${companyId}`)
      ? companyDb.model(`${type}_${companyId}`)
      : null;
  }
}
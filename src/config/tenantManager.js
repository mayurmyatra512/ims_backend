import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

// Import schemas from your models
import CompanyModel from "../models/company.schema.js";
import BankModel from "../models/bank.schema.js";
import InvoiceModel from "../models/invoices.schema.js";
import PartyModel from "../models/parties.schema.js";
import ServiceModel from "../models/services.schema.js";
import UserModel from "../models/user.schema.js";
import CounterModel from '../models/counter.schema.js';
import SettingModel from "../models/settings.schema.js";
import { ItemModel,CategoryModel, SubcategoryModel } from "../models/items.schema.js";
import { ItemBatchModel } from "../models/itemBatch.schema.js";
import items from "razorpay/dist/types/items.js";
// If you have dashboard.schema.js, import it similarly
// import DashboardModel from "../models/dashboard.schema.js";

// Fallback dashboard schema if not present
const dashboardSchema = new mongoose.Schema({}, { strict: false });

// Register master DB schemas (should be called once at app start)
export function registerMasterSchemas() {
    // Only create Company, Bank, and User schemas in the master DB
    mongoose.model("Company", CompanyModel.schema, "companies");
    mongoose.model("Bank", BankModel.schema, "banks");
    mongoose.model("User", UserModel.schema, "users");
    // DO NOT register services, parties, invoices, or dashboard in master DB
}

// Helper to get a DB connection for a company
function getCompanyDb(companyId, companyName) {
    console.log(`Using companyId: ${companyId}, companyName: ${companyName}`);
    if(!companyId || !companyName) {
        throw new Error("Invalid companyId or companyName");
    }
    // Format: companyname (lowercase, no spaces) + companyId
    let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
    const dbName = `${dbCompanyName}_${companyId}`;
    return mongoose.connection.useDb(dbName, { useCache: true });
}

// Register a new company and create collections in a separate DB
export async function registerCompany(companyData) {
    console.log("Registering company:", companyData);
    const companyId = companyData.companyId || uuidv4();
    const companyName = companyData.companyName || `company_${companyId}`;
    if (!companyId || !companyName) {
        throw new Error("Invalid companyId or companyName");
    }
    // Get DB for this company
    const companyDb = getCompanyDb(companyId, companyName);
    // Only create these schemas in the company-specific DB
    companyDb.model(`dashboard`, dashboardSchema);
    companyDb.model(`Invoice`, InvoiceModel.schema, `invoices`);
    companyDb.model(`Party`, PartyModel.schema, 'parties');
    companyDb.model(`Service`, ServiceModel.schema, 'services');
    companyDb.model('Item', ItemModel.schema, 'items');
    companyDb.model("ItemBatch", ItemBatchModel.schema, "item_batches");
    companyDb.model('Category', CategoryModel.schema, 'categories');
    companyDb.model('Subcategory', SubcategoryModel.schema, 'subcategories');
    

    // Register Counter model for company DBs
    companyDb.model('Counter', CounterModel.schema, 'counters');
    companyDb.model('Setting', SettingModel.schema, 'settings');
    // Do NOT create users, company, or bank models in company DBs
    return { companyId, companyName };
}

// Utility to get a model for a specific company and collection type
export function getCompanyModel(companyId, type) {
    const companyDb = getCompanyDb(companyId);
    const modelMap = {
        dashboard: dashboardSchema,
        invoice: InvoiceModel.schema,
        parties: PartyModel.schema,
        services: ServiceModel.schema,
        items: ItemModel.schema,
        categories: CategoryModel.schema,
        subcategories: SubcategoryModel.schema,
        itemBatches: ItemBatchModel.schema,
        user: UserModel.schema,
        item: ItemModel.schema,
    };
    if (!modelMap[type]) throw new Error("Invalid collection type");
    return companyDb.model(`${type}_${companyId}`, modelMap[type]);
}

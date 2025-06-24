import mongoose from "mongoose";
import InvoiceModel from "../models/invoices.schema.js";
import PartyModel from "../models/parties.schema.js";
import ServiceModel from "../models/services.schema.js";

function getCompanyDb(companyId, companyName) {
    let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
    const dbName = `${dbCompanyName}_${companyId}`;
    return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class DashboardRepository {
    getDashboardModel(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('dashboard')) {
            companyDb.model('dashboard', new mongoose.Schema({}, { strict: false }));
        }
        return companyDb.model('dashboard');
    }
    async countInvoices(companyId, companyName){
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('invoices')) {
            companyDb.model('invoices', InvoiceModel.schema);
        }
        const InvoiceModelDb = companyDb.model('invoices');
        return await InvoiceModelDb.countDocuments();
    }
    async countParties(companyId, companyName){
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('parties')) {
            companyDb.model('parties', PartyModel.schema);
        }
        const PartyModelDb = companyDb.model('parties');
        return await PartyModelDb.countDocuments();
    }
    async countServices(companyId, companyName){
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('services')) {
            companyDb.model('services', ServiceModel.schema);
        }
        const ServiceModelDb = companyDb.model('services');
        return await ServiceModelDb.countDocuments();
    }
    async getTotalRevenue(companyId, companyName){
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('invoices')) {
            companyDb.model('invoices', InvoiceModel.schema);
        }
        const InvoiceModelDb = companyDb.model('invoices');
        const result = await InvoiceModelDb.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        return result[0]?.total || 0;
    }
    async getRecentInvoices(companyId, companyName, limit = 5){
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('invoices')) {
            companyDb.model('invoices', InvoiceModel.schema);
        }
        const InvoiceModelDb = companyDb.model('invoices');
        const invoices = await InvoiceModelDb.find()
            .sort({ invoiceDate: -1 })
            .limit(limit)
            .populate({ path: "partyId", select: "partyName" });
        return invoices.map(inv => ({
            _id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            partyId: inv.partyId ? { partyName: inv.partyId.partyName } : null,
            date: inv.invoiceDate,
            totalAmount: inv.totalAmount
        }));
    }
}
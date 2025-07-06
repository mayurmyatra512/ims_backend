import mongoose from "mongoose";
import InvoiceModel from "../models/invoices.schema.js";
import PartyModel from "../models/parties.schema.js";
import ServiceModel from "../models/services.schema.js";

function getCompanyDb(companyId, companyName) {
    let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
    const dbName = `${dbCompanyName}_${companyId}`;
    return mongoose.connection.useDb(dbName, { useCache: true });
}

function registerModelIfMissing(companyDb, modelName, schema, collectionName) {
    if (!companyDb.models[modelName]) {
        companyDb.model(modelName, schema, collectionName);
    }
}

export default class DashboardRepository {
    getDashboardModel(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('dashboard')) {
            companyDb.model('dashboard', new mongoose.Schema({}, { strict: false }));
        }
        return companyDb.model('dashboard');
    }
    async countInvoices(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('invoices')) {
            companyDb.model('invoices', InvoiceModel.schema);
        }
        const InvoiceModelDb = companyDb.model('invoices');
        return await InvoiceModelDb.countDocuments();
    }
    async countParties(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('parties')) {
            companyDb.model('parties', PartyModel.schema);
        }
        const PartyModelDb = companyDb.model('parties');
        return await PartyModelDb.countDocuments();
    }
    async countServices(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        if (!companyDb.modelNames().includes('services')) {
            companyDb.model('services', ServiceModel.schema);
        }
        const ServiceModelDb = companyDb.model('services');
        return await ServiceModelDb.countDocuments();
    }


    // async getTotalRevenue(companyId, companyName) {
    //     const companyDb = getCompanyDb(companyId, companyName);
    //     if (!companyDb.modelNames().includes('invoices')) {
    //         companyDb.model('invoices', InvoiceModel.schema);
    //     }
    //     const InvoiceModelDb = companyDb.model('invoices');

    //     const invoices = await InvoiceModelDb.find()
    //         .populate("partyId");

    //     invoices.forEach(inv => {
    //         if (!inv.partyId) {
    //             console.log("Failed to populate for:", inv._id);
    //         }
    //     });

    //     const result = await InvoiceModelDb.aggregate([
    //         { $group: { _id: null, total: { $sum: "$paidAmount" } } }
    //     ]);
    //     console.log("Result in repo: ", result);
    //     return result[0]?.total || 0;
    // }

    async getTotalRevenue(companyId, companyName) {
        const companyDb = getCompanyDb(companyId, companyName);
        registerModelIfMissing(companyDb, 'Invoice', InvoiceModel.schema, 'invoices');

        const InvoiceModelDb = companyDb.model('Invoice');
        const result = await InvoiceModelDb.aggregate([
            { $group: { _id: null, total: { $sum: "$paidAmount" } } }
        ]);
        
        return result[0]?.total || 0;
    }


    async getRecentInvoices(companyId, companyName, limit = 5) {
        const companyDb = getCompanyDb(companyId, companyName);
        registerModelIfMissing(companyDb, 'Invoice', InvoiceModel.schema, 'invoices');
        registerModelIfMissing(companyDb, 'Party', PartyModel.schema, 'parties');

        const InvoiceModelDb = companyDb.model('Invoice');
        const invoices = await InvoiceModelDb.find()
            .populate({ path: "partyId", select: "partyName" })
            .sort({ invoiceDate: -1 })
            .limit(limit);

        return invoices.map(inv => ({
            _id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            partyId: inv.partyId ? { partyName: inv.partyId.partyName } : null,
            date: inv.invoiceDate,
            totalAmount: inv.totalAmount
        }));
    }


    // async getRecentInvoices(companyId, companyName, limit = 5) {
    //     const companyDb = getCompanyDb(companyId, companyName);
    //     // console.log(companyDb)
    //     if (!companyDb.modelNames().includes('invoices')) {
    //         companyDb.model('invoices', InvoiceModel.schema);
    //     }

    //     // Dynamically register Party model if not registered
    //     if (!companyDb.models["parties"]) {
    //         companyDb.model("parties", require("../models/PartyModel").schema); // Adjust path if needed
    //     }

    //     // Dynamically register Invoice model if not registered
    //     if (!companyDb.models["invoices"]) {
    //         companyDb.model("invoices", require("../models/InvoiceModel").schema); // Adjust path if needed
    //     }

    //     const InvoiceModelDb = companyDb.model('invoices');
    //     console.log(InvoiceModel)
    //     const invoices = await InvoiceModelDb.find()
    //         .populate({ path: "partyId", select: "partyName" })
    //         .sort({ invoiceDate: -1 })
    //         .limit(limit)
    //     // .populate({ path: "partyId", select: "partyName" });
    //     console.log("Invoices = ", invoices)
    //     return invoices.map(inv => ({
    //         _id: inv._id,
    //         invoiceNumber: inv.invoiceNumber,
    //         partyId: inv.partyId ? { partyName: inv.partyId.partyName } : null,
    //         date: inv.invoiceDate,
    //         totalAmount: inv.totalAmount
    //     }));
    // }
}
import mongoose from "mongoose";
import { createMailBody } from "../config/createMailBody.js";
import InvoiceModel from "../models/invoices.schema.js";
import PartyRepository from "./parties.repository.js";
import ServiceRepository from "./services.repository.js";
import counterSchema from '../models/counter.schema.js';

function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  const companyDb = mongoose.connection.useDb(dbName, { useCache: true });
  // Register Counter model if not already registered
  if (!companyDb.modelNames().includes('Counter')) {
    companyDb.model('Counter', counterSchema, 'counters');
  }
  return companyDb;
}

export const getNextBillNo = async (companyDb, companyId, initials, year) => {
    // Register or get the Counter model in the company DB
    const Counter = companyDb.models.Counter || companyDb.model('Counter', counterSchema);
    if (!Counter) throw new Error("Counter model not found in company database");
    // Ensure companyId is an ObjectId
    let companyObjectId = companyId;
    if (typeof companyId === 'string' && companyId.length === 24) {
        try {
            companyObjectId = new mongoose.Types.ObjectId(companyId);
        } catch (e) {
            // fallback to string if not valid ObjectId
            companyObjectId = companyId;
        }
    }
    // Get Invoice model for this company DB
    const Invoice = companyDb.models.Invoice || companyDb.model('Invoice', InvoiceModel.schema, 'invoices');
    // Count existing invoices for this year/initials
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const invoiceCount = await Invoice.countDocuments({
        invoiceNumber: { $regex: `^${initials}-${year}-` },
        invoiceDate: { $gte: startOfYear, $lte: endOfYear }
    });
    // Set seq to invoiceCount + 1 (only if seq is less)
    const counterDoc = await Counter.findOneAndUpdate(
        { companyId: companyObjectId, year, initials },
        [{
            $set: {
                seq: { $cond: [ { $lt: [ "$seq", invoiceCount + 1 ] }, invoiceCount + 1, "$seq" ] }
            }
        }],
        { new: true, upsert: true }
    );
    return counterDoc.seq;
};

export default class InvoiceRepository {
  getInvoiceModel(companyId, companyName) {
     const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Invoice')) {
      companyDb.model('Invoice', InvoiceModel.schema, 'invoices');
    }
    return companyDb.model('Invoice');
  }

  async createInvoice(companyId, companyName, invoiceData) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    const invoice = new InvoiceModel(invoiceData);
    await invoice.save();
    return invoice;
  }

  async getInvoiceById(companyId, companyName, invoiceId) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    const invoice = await InvoiceModel.findById(invoiceId)
    // .populate({ path: "services.serviceId", select: "serviceName" }).populate("partyId");
    .populate({ path: "partyId", select: "partyName contactNumber" })
    .populate({ path: "services.serviceId", select: "serviceName" });
    
    console.log("Populated partyId:", invoice.partyId);
    console.log("Populated services:", invoice.services);

    if (!invoice) throw new Error(`Invoice with ID ${invoiceId} not found`);
    return invoice;
  }

  async updateInvoice(companyId, companyName, invoiceId, invoiceData) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    const invoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { ...invoiceData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!invoice) throw new Error(`Invoice with ID ${invoiceId} not found`);
    return invoice;
  }

  async deleteInvoice(companyId, companyName, invoiceId) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    const invoice = await InvoiceModel.findByIdAndDelete(invoiceId);
    if (!invoice) throw new Error(`Invoice with ID ${invoiceId} not found`);
    return invoice;
  }

 async getAllInvoices(companyId, companyName) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    const invoices = await InvoiceModel.find();
    const companyDb = getCompanyDb(companyId, companyName);
    const PartyModel = PartyRepository.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    const ServiceModel = ServiceRepository.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    for (const invoice of invoices) {
        console.log('Invoice partyId:', invoice.partyId);
        const party = await PartyModel.findById(invoice.partyId);
        console.log('Party found:', party);
        for (const s of invoice.services) {
            console.log('ServiceId:', s.serviceId);
            const service = await ServiceModel.findById(s.serviceId);
            console.log('Service found:', service);
        }
    }
    return await InvoiceModel.find()
      .populate({ path: "partyId", select: "partyName" })
      .populate({ path: "services.serviceId", select: "serviceName" });
}
}
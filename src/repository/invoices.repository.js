import mongoose from "mongoose";
import { createMailBody } from "../config/createMailBody.js";
import InvoiceModel from "../models/invoices.schema.js";
import PartyRepository from "./parties.repository.js";
import ServiceRepository from "./services.repository.js";
import counterSchema from '../models/counter.schema.js';
import CounterModel from "../models/counter.schema.js";
import CompanyRepository from "./company.repository.js";
import PartyModel from "../models/parties.schema.js";
import ServiceModel from "../models/services.schema.js";
import { ItemModel } from "../models/items.schema.js";
import UserModel from "../models/user.schema.js";

function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  const companyDb = mongoose.connection.useDb(dbName, { useCache: true });
  // Register Counter model if not already registered
  if (!companyDb.modelNames().includes('Counter')) {
    companyDb.model('Counter', CounterModel.schema, 'counters');
  }
  return companyDb;
}

// export const getNextBillNo = async (companyDb, companyId, initials, year) => {
//     // Register or get the Counter model in the company DB
//     const Counter = companyDb.models.Counter || companyDb.model('Counter', counterSchema);
//     if (!Counter) throw new Error("Counter model not found in company database");
//     // Ensure companyId is an ObjectId
//     let companyObjectId = companyId;
//     if (typeof companyId === 'string' && companyId.length === 24) {
//         try {
//             companyObjectId = new mongoose.Types.ObjectId(companyId);
//         } catch (e) {
//             // fallback to string if not valid ObjectId
//             companyObjectId = companyId;
//         }
//     }
//     // Get Invoice model for this company DB
//     const Invoice = companyDb.models.Invoice || companyDb.model('Invoice', InvoiceModel.schema, 'invoices');
// // Count existing invoices for this year/initials
// const now = new Date();
// const startOfYear = new Date(now.getFullYear(), 0, 1);
// const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
// const invoiceCount = await Invoice.countDocuments({
//     invoiceNumber: { $regex: `^${initials}-${year}-` },
//     invoiceDate: { $gte: startOfYear, $lte: endOfYear }
// });
//     // Set seq to invoiceCount + 1 (only if seq is less)
//     const counterDoc = await Counter.findOneAndUpdate(
//         { companyId: companyObjectId, year, initials },
//         [{
//             $set: {
//                 seq: { $cond: [ { $lt: [ "$seq", invoiceCount + 1 ] }, invoiceCount + 1, "$seq" ] }
//             }
//         }],
//         { new: true, upsert: true }
//     );
//     return counterDoc.seq;
// };

export default class InvoiceRepository {
  constructor() {
    this.companyRepository = new CompanyRepository();
  }
  getInvoiceModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Invoice')) {
      companyDb.model('Invoice', InvoiceModel.schema, 'invoices');
    }
    return companyDb.model('Invoice');
  }
  getCounterModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Counter')) {
      companyDb.model('Counter', CounterModel.schema, 'counters');
    }
    return companyDb.model('Counter');
  }

  // Helper method to ensure all referenced models are registered
  ensureModelsRegistered(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    console.log(`Ensuring models registered for company ${companyId}/${companyName}`);
    console.log(`Company DB before registration:`, companyDb.modelNames());

    if (!companyDb.modelNames().includes('Party')) {
      console.log('Registering Party model');
      companyDb.model('Party', PartyModel.schema, 'parties');
    }
    if (!companyDb.modelNames().includes('Service')) {
      console.log('Registering Service model');
      companyDb.model('Service', ServiceModel.schema, 'services');
    }
    if (!companyDb.modelNames().includes('Item')) {
      console.log('Registering Item model');
      console.log('ItemModel available:', !!ItemModel);
      console.log('ItemModel.schema available:', !!(ItemModel && ItemModel.schema));
      companyDb.model('Item', ItemModel.schema, 'items');
    }
    if (!companyDb.modelNames().includes('User')) {
      console.log('Registering User model');
      companyDb.model('User', UserModel.schema, 'users');
    }

    console.log(`Company DB after registration:`, companyDb.modelNames());
  }
  // getPartyModel(companyId, companyName) {
  //   const companyDb = getCompanyDb(companyId, companyName);
  //   if (!companyDb) throw new Error("Company database not found");
  //   // Register the model if not already registered
  //   if (!companyDb.modelNames().includes('Party')) {
  //     companyDb.model('Party', PartyModel.schema, 'parties');
  //   }
  //   return companyDb.model('Party');
  // }
  async getNextInvoiceNumber(companyId, year, initials) {
    try {
      const companyName = await this.companyRepository.getCompanyById(companyId).then(company => company.companyName);
      if (!companyName) throw new Error("Company name not found for the given companyId");
      const CounterModel = this.getCounterModel(companyId, companyName);
      if (!CounterModel) throw new Error("Counter collection not found for this company");
      // Ensure companyId is an ObjectId
      let companyObjectId = companyId;
      if (typeof companyId === 'string' && companyId.length === 24) {
        try {
          companyObjectId = new mongoose.Types.ObjectId(companyId);
        } catch (e) {
          companyObjectId = companyId;
        }
      }
      // Fetch current seq (do not update)
      let counterDoc = await CounterModel.findOne({ companyId: companyObjectId, year, initials });
      let nextSeq = counterDoc && counterDoc.seq;
      console.log("Next seq from counter doc:", nextSeq);
      if (nextSeq === null || nextSeq === undefined) {
        // No counter doc exists, start with seq 1
        nextSeq = 0;
        counterDoc = await CounterModel.create({ companyId: companyObjectId, year, initials, seq: nextSeq });
        console.log("Created new counter doc:", counterDoc);
      } else {
        // Counter doc exists, but we do not update it here (seq is updated after invoice creation)
        nextSeq = counterDoc.seq + 1; // This is the next seq to be used, but we do not save it yet
      }
      console.log("Current counter doc:", counterDoc);
      console.log("Calculated next seq:", nextSeq);
      console.log("Generated next invoice number:", `${initials}-${year}-${nextSeq.toString().padStart(4, '0')}`);
      return `${initials}-${year}-${nextSeq.toString().padStart(4, '0')}`;
    } catch (err) {
      console.error("Error fetching next invoice number:", err);
      throw err;
    }
  }

  async createInvoice(companyId, companyName, invoiceData) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    const invoice = new InvoiceModel(invoiceData);
    console.log("Creating invoice with data:", invoice);
    const resp = await invoice.save();
    console.log("Invoice created:", resp);
    // After saving, update the counter seq if needed
    try {
      // Parse invoiceNumber to get initials, year, seq
      const invoiceNumber = invoiceData.invoiceNumber;
      const match = invoiceNumber.match(/^(.*)-(\d{4})-(\d{4})$/);
      if (match) {
        const initials = match[1];
        const year = match[2];
        const seq = parseInt(match[3], 10);
        console.log("Parsed invoice number:", { initials, year, seq });
        const CounterModel = this.getCounterModel(companyId, companyName);
        let companyObjectId = companyId;
        if (typeof companyId === 'string' && companyId.length === 24) {
          try {
            companyObjectId = new mongoose.Types.ObjectId(companyId);
          } catch (e) {
            companyObjectId = companyId;
          }
        }
        // Only update if seq is greater than current
        const res = await CounterModel.findOneAndUpdate(
          { companyId: companyObjectId, year, initials },
          { $inc: { seq: 1 } },
          { upsert: true }
        );
        console.log("Counter update result:", res);
      }
    } catch (err) {

      console.error("Error updating counter after invoice save:", err);
    }
    return invoice;
  }

  async getInvoiceById(companyId, companyName, invoiceId) {
    // Only attempt to cast invoiceId to ObjectId if it looks like a valid ObjectId
    let id = invoiceId;
    if (typeof invoiceId === 'string' && invoiceId.length === 24 && /^[a-fA-F0-9]+$/.test(invoiceId)) {
      try {
        id = new mongoose.Types.ObjectId(invoiceId);
      } catch (e) {
        // fallback to string if not valid ObjectId
        id = invoiceId;
      }
    }
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered in the company database
    this.ensureModelsRegistered(companyId, companyName);

    console.log(`Attempting to populate invoice ${id}`);
    console.log(`Company DB models:`, getCompanyDb(companyId, companyName).modelNames());

    const companyDb = getCompanyDb(companyId, companyName);
    const invoice = await InvoiceModel.findById(id)
      .populate({ 
        path: "partyId", 
        select: "partyName contactNumber address gstin pan",
        model: companyDb.model('Party')
      })
      .populate({ 
        path: "services.serviceId", 
        select: "serviceName price",
        model: companyDb.model('Service')
      })
      .populate({ 
        path: "items.itemId", 
        select: "name price",
        model: companyDb.model('Item')
      })
      .populate({ 
        path: "createdBy", 
        select: "name email",
        model: companyDb.model('User')
      });

    console.log("Populated partyId:", invoice?.partyId);
    console.log("Populated services:", invoice?.services);
    console.log("Populated items:", invoice?.items);
    console.log("Raw items before populate:", JSON.stringify(invoice?.items, null, 2));

    if (!invoice) throw new Error(`Invoice with ID ${invoiceId} not found`);
    return invoice;
  }



  async updateInvoice(companyId, companyName, invoiceId, invoiceData) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");
    console.log("Updating invoice with data:", invoiceData);
    // First update the invoice
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { ...invoiceData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) throw new Error(`Invoice with ID ${invoiceId} not found`);

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    // Then populate the updated invoice
    const populatedInvoice = await InvoiceModel.findById(updatedInvoice._id)
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return populatedInvoice;
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

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoiceList = await InvoiceModel.find()
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    console.log("Invoice List = ", invoiceList);
    return invoiceList;
  }

  async getInvoiceByNumber(companyId, companyName, invoiceNumber) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoice = await InvoiceModel.findOne({ invoiceNumber })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    if (!invoice) throw new Error(`Invoice with number ${invoiceNumber} not found`);
    return invoice;
  }

  async getInvoicesByPartyId(companyId, companyName, partyId) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({ partyId })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByServiceId(companyId, companyName, serviceId) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({ "services.serviceId": serviceId })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByDateRange(companyId, companyName, startDate, endDate) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({
      invoiceDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByPartyName(companyId, companyName, partyName) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find()
      .populate({ path: "partyId", match: { partyName: { $regex: partyName, $options: "i" } }, select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices.filter(inv => inv.partyId !== null);
  }

  async getPendingInvoices(companyId, companyName) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({ status: "Pending" })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getPaidInvoices(companyId, companyName) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({ status: "Paid" })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getCancelledInvoices(companyId, companyName) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({ status: "Cancelled" })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByStatus(companyId, companyName, status) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({ status })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByAmountRange(companyId, companyName, minAmount, maxAmount) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({
      totalAmount: { $gte: minAmount, $lte: maxAmount }
    })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByPaidAmountRange(companyId, companyName, minPaidAmount, maxPaidAmount) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({
      paidAmount: { $gte: minPaidAmount, $lte: maxPaidAmount }
    })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByPendingAmountRange(companyId, companyName, minPendingAmount, maxPendingAmount) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({
      pendingAmount: { $gte: minPendingAmount, $lte: maxPendingAmount }
    })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }

  async getInvoicesByCreatedAtRange(companyId, companyName, startDate, endDate) {
    const InvoiceModel = this.getInvoiceModel(companyId, companyName);
    if (!InvoiceModel) throw new Error("Invoice collection not found for this company");

    // Ensure all referenced models are registered
    this.ensureModelsRegistered(companyId, companyName);

    const invoices = await InvoiceModel.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate({ path: "partyId", select: "partyName contactNumber address gstin pan" })
      .populate({ path: "services.serviceId", select: "serviceName price" })
      .populate({ path: "items.itemId", select: "name price" })
      .populate({ path: "createdBy", select: "name email" });

    return invoices;
  }
}

// Utility: Only cast to ObjectId if string is a valid 24-char hex
export function safeObjectId(id) {
  if (typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (e) {
      return id;
    }
  }
  return id;
}
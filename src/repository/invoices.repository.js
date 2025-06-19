import { createMailBody } from "../config/createMailBody.js";
import InvoiceModel from "../models/invoices.schema.js";
// import { appendInvoiceRow, deleteInvoiceRow, updateInvoiceRow } from "../config/googleSheetService.js";

export default class InvoiceRepository {
 
  async createInvoice(invoiceData) {
    try {
      const invoice = new InvoiceModel(invoiceData);
      await invoice.save();
      console.log("Invoice After Saving", invoice);
      await createMailBody("max123mek@gmail.com", `${invoice.invoiceNumber} - ${invoice.invoiceDate}`, invoice);

      // Append the invoice in Excel file after checking if it exists 
      
      // await appendInvoiceRow(invoice);
      return invoice;
    } catch (error) {
      console.log("Error in Repository", error);
      throw new Error(`Error creating invoice: ${error.message}`);
    }
  }

  async getInvoiceById(invoiceId) {
    try {
      const invoice = await InvoiceModel.findById(invoiceId).populate({ path: "services.serviceId", select: "serviceName" }).populate("partyId");
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }
      return invoice;
    }
    catch (error) {
      throw new Error(`Error fetching invoice: ${error.message}`);
    }
  }
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const invoice = await InvoiceModel.findByIdAndUpdate(
        invoiceId,
        { ...invoiceData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }
      // await updateInvoiceRow(invoice);
      return invoice;
    } catch (error) {
      throw new Error(`Error updating invoice: ${error.message}`);
    }
  }
  async deleteInvoice(invoiceId) {
    try {
      const invoice = await InvoiceModel.findByIdAndDelete(invoiceId);
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }
      // await deleteInvoiceRow(invoice.invoiceNumber);
      return invoice;
    } catch (error) {
      throw new Error(`Error deleting invoice: ${error.message}`);
    }
  }
  async getAllInvoices() {
    try {
      const invoices = await InvoiceModel.find().populate({ path: "services.serviceId", select: "serviceName" }).populate("partyId");;
      // Format dates to yyyy-MM-DD for all invoices
      const formattedInvoices = invoices.map(inv => {
        const formatDate = (date) => {
          if (!date) return null;
          const d = new Date(date);
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${d.getFullYear()}-${month}-${day}`;
        };
        return {
          ...inv.toObject(),
          invoiceDate: formatDate(inv.invoiceDate),
          createdAt: formatDate(inv.createdAt),
          updatedAt: formatDate(inv.updatedAt)
        };
      });
      return formattedInvoices;
    } catch (error) {
      throw new Error(`Error fetching invoices: ${error.message}`);
    }
  }
  async getInvoiceByNumber(invoiceNumber) {
    try {
      const invoice = await InvoiceModel.findOne({ invoiceNumber }).populate("services parties");
      if (!invoice) {
        throw new Error(`Invoice with number ${invoiceNumber} not found`);
      }
      return invoice;
    }
    catch (error) {
      throw new Error(`Error fetching invoice by number: ${error.message}`);
    }
  }
  async getInvoicesByPartyId(partyId) {
    try {
      const invoices = await InvoiceModel.find({ parties: partyId }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found for party with ID ${partyId}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by party ID: ${error.message}`);
    }
  }
  async getInvoicesByDateRange(startDate, endDate) {
    try {
      const invoices = await InvoiceModel.find({
        invoiceDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found in the date range ${startDate} to ${endDate}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by date range: ${error.message}`);
    }
  }
  async getPendingInvoices() {
    try {
      const invoices = await InvoiceModel.find({ status: "Pending" }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error("No pending invoices found");
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching pending invoices: ${error.message}`);
    }
  }
  async getPaidInvoices() {
    try {
      const invoices = await InvoiceModel.find({ status: "Paid" }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error("No paid invoices found");
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching paid invoices: ${error.message}`);
    }
  }
  async getCancelledInvoices() {
    try {
      const invoices = await InvoiceModel.find({ status: "Cancelled" }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error("No cancelled invoices found");
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching cancelled invoices: ${error.message}`);
    }
  }
  async getInvoicesByStatus(status) {
    try {
      const invoices = await InvoiceModel.find({ status }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found with status ${status}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by status: ${error.message}`);
    }
  }
  async getInvoicesByServiceId(serviceId) {
    try {
      const invoices = await InvoiceModel.find({ "services.serviceId": serviceId }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found for service with ID ${serviceId}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by service ID: ${error.message}`);
    }
  }
  async getInvoicesByAmountRange(minAmount, maxAmount) {
    try {
      const invoices = await InvoiceModel.find({
        totalAmount: {
          $gte: minAmount,
          $lte: maxAmount,
        },
      }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found in the amount range ${minAmount} to ${maxAmount}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by amount range: ${error.message}`);
    }
  }
  async getInvoicesByPaidAmountRange(minPaidAmount, maxPaidAmount) {
    try {
      const invoices = await InvoiceModel.find({
        paidAmount: {
          $gte: minPaidAmount,
          $lte: maxPaidAmount,
        },
      }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found in the paid amount range ${minPaidAmount} to ${maxPaidAmount}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by paid amount range: ${error.message}`);
    }
  }
  async getInvoicesByPendingAmountRange(minPendingAmount, maxPendingAmount) {
    try {
      const invoices = await InvoiceModel.find({
        pendingAmount: {
          $gte: minPendingAmount,
          $lte: maxPendingAmount,
        },
      }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found in the pending amount range ${minPendingAmount} to ${maxPendingAmount}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by pending amount range: ${error.message}`);
    }
  }
  async getInvoicesByPartyName(partyName) {
    try {
      const invoices = await InvoiceModel.find({ "parties.partyName": new RegExp(partyName, "i") }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found for party with name ${partyName}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by party name: ${error.message}`);
    }
  }
  async getInvoicesByServiceName(serviceName) {
    try {
      const invoices = await InvoiceModel.find({ "services.serviceName": new RegExp(serviceName, "i") }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found for service with name ${serviceName}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by service name: ${error.message}`);
    }
  }
  // async getInvoicesByDescription(description) {
  // try {
  //   const invoices = await InvoiceModel.find({ description: new RegExp(description, "i") }).populate("services parties");
  //   if (invoices.length === 0) {
  //     throw new Error(`No invoices found with description ${description}`);
  //   }
  //   return invoices;
  // } catch (error) {
  //   throw new Error(`Error fetching invoices by description: ${error.message}`);
  // }
  // }
  async getInvoicesByCreatedAtRange(startDate, endDate) {
    try {
      const invoices = await InvoiceModel.find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found in the created at range ${startDate} to ${endDate}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by created at range: ${error.message}`);
    }
  }
  async getInvoicesByUpdatedAtRange(startDate, endDate) {
    try {
      const invoices = await InvoiceModel.find({
        updatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found in the updated at range ${startDate} to ${endDate}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by updated at range: ${error.message}`);
    }
  }
  async getInvoicesByCreatedBy(createdBy) {
    try {
      const invoices = await InvoiceModel.find({ createdBy }).populate("services parties");
      if (invoices.length === 0) {
        throw new Error(`No invoices found created by ${createdBy}`);
      }
      return invoices;
    } catch (error) {
      throw new Error(`Error fetching invoices by created by: ${error.message}`);
    }
  }

}
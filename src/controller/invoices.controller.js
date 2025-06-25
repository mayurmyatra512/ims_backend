import { createMailBody } from "../config/createMailBody.js";
import BankRepository from "../repository/bank.repository.js";
import InvoiceRepository, { getNextBillNo } from "../repository/invoices.repository.js";
import PartyRepository from "../repository/parties.repository.js";
import ServiceRepository from "../repository/services.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import InvoiceModel from "../models/invoices.schema.js";
import mongoose from "mongoose";

function getInitialsFromName(name) {
    if (!name) return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0].toUpperCase())
        .join('');
}

export default class InvoicesController {
    constructor() {
        this.invoiceRepository = new InvoiceRepository();
        this.bankRepository = new BankRepository(); // Add this line
    }
    async createInvoice(req, res) {
        try {
            const invoiceData = req.body;
            const companyName = await getCompanyNameById(req.params.companyId);
            const party = await PartyRepository.getPartyByName(
                req.params.companyId,
                companyName,
                invoiceData.customer.name // Pass only the name string
            );
            if (!party) {
                return res.status(400).json({ message: "Party not found" });
            }

            // const bankDetails = await this.bankRepository.getBankByCompanyId(req.params.companyId); // Use instance method

            // Build services array with serviceId and vehicleNum

            
            const services = await Promise.all(
                invoiceData.items.map(async (item) => {
                    const service = await ServiceRepository.getServiceByName(req.params.companyId, companyName, item.service);
                    return {
                        serviceId: new ObjectId(service._id),
                        amount: item.price,
                        vehicleNum: item.name || "",
                    };
                })
            );
            console.log('Invoice Data = ', invoiceData);
            const totalAmount = invoiceData.paidAmount + invoiceData.pendingAmount;
            const status = invoiceData.pendingAmount > 0 ? "Pending" : "Paid";
            const data = {
                invoiceNumber: invoiceData.billNo,
                partyId: new ObjectId(party._id),
                services,
                totalAmount,
                invoiceDate: invoiceData.invoiceDate,
                paidAmount: invoiceData.paidAmount,
                pendingAmount: invoiceData.pendingAmount,
                mobile: invoiceData.customer.mobile, // Assuming customer.mobile is passed in the request body
                status,
                createdBy: new ObjectId(invoiceData.createdBy), // Assuming createdBy is passed in the request body
            };
            const invoice = await this.invoiceRepository.createInvoice(req.params.companyId, companyName, data);
            console.log('Party = ', party);
            // await createMailBody("max123mek@gmail.com", `${invoice.invoiceNumber} - ${invoice.invoiceDate}`, invoice, party, invoiceData.items, bankDetails);
            res.status(201).json(invoice);
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoiceById(req, res) {
        try {
            const invoiceId = req.params.id;
            const companyName = await getCompanyNameById(req.params.companyId);
            console.log(invoiceId)
            const invoice = await this.invoiceRepository.getInvoiceById(req.params.companyId, companyName, invoiceId);
            console.log("Invoice found in controller :", invoice);
            res.status(200).json(invoice);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }
    async updateInvoice(req, res) {
        try {
            const invoiceId = req.params.id;
            const invoiceData = req.body;
            const companyName = await getCompanyNameById(req.params.companyId);
            const updatedInvoice = await this.invoiceRepository.updateInvoice(req.params.companyId, companyName, invoiceId, invoiceData);
            res.status(200).json(updatedInvoice);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async deleteInvoice(req, res) {
        try {
            const invoiceId = req.params.id;
            const companyName = await getCompanyNameById(req.params.companyId);
            const deletedInvoice = await this.invoiceRepository.deleteInvoice(req.params.companyId, companyName, invoiceId);
            res.status(200).json(deletedInvoice);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async getAllInvoices(req, res) {
        try {
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getAllInvoices(req.params.companyId, companyName);
            console.log(invoices);
            res.status(200).json(invoices);
        } catch (error) {
            console.log("Error in Controller = ", error)
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoiceByNumber(req, res) {
        try {
            const invoiceNumber = req.params.number;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoice = await this.invoiceRepository.getInvoiceByNumber(req.params.companyId, companyName, invoiceNumber);
            res.status(200).json(invoice);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async getInvoicesByPartyId(req, res) {
        try {
            const partyId = req.params.partyId;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByPartyId(req.params.companyId, companyName, partyId);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByServiceId(req, res) {
        try {
            const serviceId = req.params.serviceId;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByServiceId(req.params.companyId, companyName, serviceId);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // async getInvoicesByDescription(req, res) {
    //     try {
    //         const description = req.params.description;
    //         const invoices = await this.invoiceRepository.getInvoicesByDescription(description);
    //         res.status(200).json(invoices);
    //     } catch (error) {
    //         res.status(500).json({ message: error.message });
    //     }
    // }
    async getInvoicesByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByDateRange(req.params.companyId, companyName, startDate, endDate);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByPartyName(req, res) {
        try {
            const partyName = req.params.partyName;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByPartyName(req.params.companyId, companyName, partyName);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPendingInvoices(req, res) {
        try {
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getPendingInvoices(req.params.companyId, companyName);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPaidInvoices(req, res) {
        try {
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getPaidInvoices(req.params.companyId, companyName);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getCancelledInvoices(req, res) {
        try {
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getCancelledInvoices(req.params.companyId, companyName);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByStatus(req, res) {
        try {
            const status = req.params.status;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByStatus(req.params.companyId, companyName, status);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByAmountRange(req, res) {
        try {
            const { minAmount, maxAmount } = req.query;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByAmountRange(req.params.companyId, companyName, minAmount, maxAmount);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByPaidAmountRange(req, res) {
        try {
            const { minPaidAmount, maxPaidAmount } = req.query;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByPaidAmountRange(req.params.companyId, companyName, minPaidAmount, maxPaidAmount);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByPendingAmountRange(req, res) {
        try {
            const { minPendingAmount, maxPendingAmount } = req.query;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByPendingAmountRange(req.params.companyId, companyName, minPendingAmount, maxPendingAmount);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByCreatedAtRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByCreatedAtRange(req.params.companyId, companyName, startDate, endDate);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByUpdatedAtRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByUpdatedAtRange(req.params.companyId, companyName, startDate, endDate);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByCreatedBy(req, res) {
        try {
            const createdBy = req.params.createdBy;
            const companyName = await getCompanyNameById(req.params.companyId);
            const invoices = await this.invoiceRepository.getInvoicesByCreatedBy(req.params.companyId, companyName, createdBy);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getGeneratedBillNo(req, res) {
        try {
            const companyId = req.params.companyId;
            if (!companyId) {
                return res.status(400).json({ message: "Company ID is required" });
            }
            const companyName = await getCompanyNameById(req.params.companyId);
            if (!companyName) {
                return res.status(404).json({ message: "Company not found" });
            }
            const userName = req.query.userName || "";
            if (!userName) {
                return res.status(400).json({ message: "User name is required" });
            }
            const now = dayjs();
            const year = now.format("YYYY");
            const initials = getInitialsFromName(userName);
            console.log("Initials:", initials);
            if (!initials) {
                return res.status(400).json({ message: "Invalid user name for generating initials" });
            }
            let dbCompanyName = companyName.toLowerCase().replace(/\s+/g, "") + "_" + companyId;
            let dbName = `${dbCompanyName}`;
            // Get company DB using mongoose directly
            const companyDb = mongoose.connection.useDb(dbName, { useCache: true });
            console.log("Company DB:", companyDb.name);
            if (!companyDb) {
                return res.status(500).json({ message: "Failed to connect to company database" });
            }
            // Use counter collection for atomic increment
            const nextSeq = await getNextBillNo(companyDb, companyId, initials, year);
            console.log("Next Sequence Number:", nextSeq);
            if (nextSeq === null || nextSeq === undefined) {
                return res.status(500).json({ message: "Failed to generate bill number" });
            }
            const countStr = String(nextSeq).padStart(2, '0');
            const billNo = `${initials}-${year}-${countStr}`;
            console.log("Generated Bill No:", billNo);
            res.status(200).json({ billNo });
        } catch (error) {
            console.error("Error generating bill number:", error);
            res.status(500).json({ message: error.message });
        }
    }

}
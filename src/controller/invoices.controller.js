import InvoiceRepository from "../repository/invoices.repository.js";
import PartyRepository from "../repository/parties.repository.js";
import ServiceRepository from "../repository/services.repository.js";

export default class InvoicesController {
    constructor() {
        this.invoiceRepository = new InvoiceRepository();
    }
    async createInvoice(req, res) {
        try {
            const invoiceData = req.body;
            const party = await PartyRepository.getPartyByName(invoiceData.customer.name)
            if (!party) {
                return res.status(400).json({ message: "Party not found" });
            }
            // Build services array with serviceId and vehicleNum
            const services = await Promise.all(
                invoiceData.items.map(async (item) => {
                    const service = await ServiceRepository.getServiceByName(item.service);
                    return {
                        serviceId: service._id,
                        amount: item.price,
                        vehicleNum: item.name,
                    };
                })
            );
            const totalAmount = invoiceData.paidAmount + invoiceData.pendingAmount;
            const status = invoiceData.pendingAmount > 0 ? "Pending" : "Paid";
            const data = {
                invoiceNumber: invoiceData.billNo,
                partyId: party._id,
                services,
                totalAmount,
                invoiceDate: invoiceData.invoiceDate,
                paidAmount: invoiceData.paidAmount,
                pendingAmount: invoiceData.pendingAmount,
                status,
                createdBy: party._id,
            };
            console.log(data)
            const invoice = await this.invoiceRepository.createInvoice(data);
            console.log(invoice)
            res.status(201).json(invoice);
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoiceById(req, res) {
        try {
            const invoiceId = req.params.id;
            console.log(invoiceId)
            const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);
            console.log(invoice);
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
            const updatedInvoice = await this.invoiceRepository.updateInvoice(invoiceId, invoiceData);
            res.status(200).json(updatedInvoice);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async deleteInvoice(req, res) {
        try {
            const invoiceId = req.params.id;
            const deletedInvoice = await this.invoiceRepository.deleteInvoice(invoiceId);
            res.status(200).json(deletedInvoice);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async getAllInvoices(req, res) {
        try {
            const invoices = await this.invoiceRepository.getAllInvoices();
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
            const invoice = await this.invoiceRepository.getInvoiceByNumber(invoiceNumber);
            res.status(200).json(invoice);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async getInvoicesByPartyId(req, res) {
        try {
            const partyId = req.params.partyId;
            const invoices = await this.invoiceRepository.getInvoicesByPartyId(partyId);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByServiceId(req, res) {
        try {
            const serviceId = req.params.serviceId;
            const invoices = await this.invoiceRepository.getInvoicesByServiceId(serviceId);
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
            const invoices = await this.invoiceRepository.getInvoicesByDateRange(startDate, endDate);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByPartyName(req, res) {
        try {
            const partyName = req.params.partyName;
            const invoices = await this.invoiceRepository.getInvoicesByPartyName(partyName);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPendingInvoices(req, res) {
        try {
            const invoices = await this.invoiceRepository.getPendingInvoices();
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPaidInvoices(req, res) {
        try {
            const invoices = await this.invoiceRepository.getPaidInvoices();
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getCancelledInvoices(req, res) {
        try {
            const invoices = await this.invoiceRepository.getCancelledInvoices();
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByStatus(req, res) {
        try {
            const status = req.params.status;
            const invoices = await this.invoiceRepository.getInvoicesByStatus(status);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByAmountRange(req, res) {
        try {
            const { minAmount, maxAmount } = req.query;
            const invoices = await this.invoiceRepository.getInvoicesByAmountRange(minAmount, maxAmount);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByPaidAmountRange(req, res) {
        try {
            const { minPaidAmount, maxPaidAmount } = req.query;
            const invoices = await this.invoiceRepository.getInvoicesByPaidAmountRange(minPaidAmount, maxPaidAmount);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByPendingAmountRange(req, res) {
        try {
            const { minPendingAmount, maxPendingAmount } = req.query;
            const invoices = await this.invoiceRepository.getInvoicesByPendingAmountRange(minPendingAmount, maxPendingAmount);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByCreatedAtRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const invoices = await this.invoiceRepository.getInvoicesByCreatedAtRange(startDate, endDate);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByUpdatedAtRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const invoices = await this.invoiceRepository.getInvoicesByUpdatedAtRange(startDate, endDate);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getInvoicesByCreatedBy(req, res) {
        try {
            const createdBy = req.params.createdBy;
            const invoices = await this.invoiceRepository.getInvoicesByCreatedBy(createdBy);
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}
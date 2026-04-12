import { createMailBody } from "../config/createMailBody.js";
import BankRepository from "../repository/bank.repository.js";
import InvoiceRepository from "../repository/invoices.repository.js";
import PartyRepository from "../repository/parties.repository.js";
import ServiceRepository from "../repository/services.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import InvoiceModel from "../models/invoices.schema.js";
import mongoose from "mongoose";
import ItemRepository from "../repository/items.repository.js";





export default class InvoicesController {
    constructor() {
        this.invoiceRepository = new InvoiceRepository();
        this.bankRepository = new BankRepository(); // Add this line
        this.itemRepository = new ItemRepository();
    }
    async createInvoice(req, res) {
        // try {
        //     const invoiceData = req.body;
        //     const companyName = await getCompanyNameById(req.params.companyId);
        //     const party = await PartyRepository.getPartyByName(
        //         req.params.companyId,
        //         companyName,
        //         invoiceData.customer.name // Pass only the name string
        //     );
        //     if (!party) {
        //         return res.status(400).json({ message: "Party not found" });
        //     }

        //     const services = await Promise.all(
        //         invoiceData.items.map(async (item) => {
        //             const service = await ServiceRepository.getServiceByName(req.params.companyId, companyName, item.service);
        //             return {
        //                 serviceId: new ObjectId(service._id),
        //                 amount: item.price,
        //                 vehicleNum: item.name || "",
        //             };
        //         })
        //     );
        //     console.log('Invoice Data = ', invoiceData);
        //     const totalAmount = invoiceData.paidAmount + invoiceData.pendingAmount;
        //     const status = invoiceData.pendingAmount > 0 ? "Pending" : "Paid";
        //     const data = {
        //         invoiceNumber: invoiceData.billNo,
        //         partyId: new ObjectId(party._id),
        //         services,
        //         totalAmount,
        //         invoiceDate: invoiceData.invoiceDate,
        //         paidAmount: invoiceData.paidAmount,
        //         pendingAmount: invoiceData.pendingAmount,
        //         mobile: invoiceData.customer.mobile, // Assuming customer.mobile is passed in the request body
        //         status,
        //         createdBy: new ObjectId(invoiceData.createdBy), // Assuming createdBy is passed in the request body
        //     };
        //     const invoice = await this.invoiceRepository.createInvoice(req.params.companyId, companyName, data);
        //     console.log('Party = ', party);
        //     // await createMailBody("max123mek@gmail.com", `${invoice.invoiceNumber} - ${invoice.invoiceDate}`, invoice, party, invoiceData.items, bankDetails);
        //     res.status(201).json(invoice);
        // } catch (error) {
        //     console.log(error)
        //     res.status(500).json({ message: error.message });
        // }

        try {
            const invoiceData = req.body;
            const { companyId } = req.params;
            const companyName = await getCompanyNameById(companyId);

            console.log("Invoice Data = ", invoiceData);

            // 1. Fetch Party/Customer
            const party = await PartyRepository.getPartyByName(
                companyId,
                companyName,
                invoiceData.customer.name
            );
            if (!party) return res.status(400).json({ message: "Party not found" });

            // 2. Process RTO Services (items array from ServiceForm)
            const services = await Promise.all(
                (invoiceData.items || []).map(async (item) => {
                    const service = await ServiceRepository.getServiceByName(companyId, companyName, item.service);
                    return {
                        serviceId: new ObjectId(service._id),
                        amount: Number(item.price),
                        vehicleNum: item.name || "",
                    };
                })
            );
            console.log("Services = ", services);

            // 3. Process Inventory Items (invoiceItems array from ItemsForm)
            const inventoryItems = [];
            if (invoiceData.inventoryItems && invoiceData.inventoryItems.length > 0) {
                for (const invItem of invoiceData.inventoryItems) {
                    console.log(`Processing inventory item:`, invItem);
                    try {
                        const itemMaster = await ItemRepository.getItemByName(companyId, companyName, invItem.name);
                        console.log(`Found item master:`, itemMaster);
                        console.log(`Item master _id:`, itemMaster._id);
                        inventoryItems.push({
                            itemId: new ObjectId(itemMaster._id),
                            itemQuantity: Number(invItem.quantity),
                            itemPrice: Number(invItem.rate),
                            total: Number(invItem.quantity) * Number(invItem.rate)
                        });
                    } catch (error) {
                        console.error(`Error finding item "${invItem.name}":`, error.message);
                        // Option 1: Create the item if it doesn't exist
                        console.log(`Creating new item "${invItem.name}" since it doesn't exist`);
                        try {
                            const newItemData = {
                                name: invItem.name,
                                itemCode: `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                price: Number(invItem.rate),
                                totalQty: Number(invItem.quantity),
                                availableQty: Number(invItem.quantity),
                                unitOfMeasure: 'pcs',
                                createdBy: new ObjectId(invoiceData.createdBy)
                            };
                            const createdItem = await ItemRepository.createItem(companyId, companyName, newItemData);
                            console.log(`Created new item:`, createdItem);
                            inventoryItems.push({
                                itemId: new ObjectId(createdItem._id),
                                itemQuantity: Number(invItem.quantity),
                                itemPrice: Number(invItem.rate),
                                total: Number(invItem.quantity) * Number(invItem.rate)
                            });
                        } catch (createError) {
                            console.error(`Failed to create item "${invItem.name}":`, createError.message);
                            throw new Error(`Item "${invItem.name}" not found and could not be created automatically.`);
                        }
                    }
                }
            }
            console.log("Final Inventory Items = ", inventoryItems);

            // 4. Calculate Logic
            const totalAmount = Number(invoiceData.totalAmount); // Passed from frontend getGrandTotal()
            const status = invoiceData.pendingAmount > 0 ? "Pending" : "Paid";

            const data = {
                invoiceNumber: invoiceData.billNo,
                partyId: new ObjectId(party._id),
                services,           // RTO Services
                items: inventoryItems,     // Physical Products
                totalAmount,

                invoiceDate: invoiceData.invoiceDate,
                paidAmount: Number(invoiceData.paidAmount),
                pendingAmount: Number(invoiceData.pendingAmount),
                mobile: invoiceData.customer.mobile,
                status,
                createdBy: new ObjectId(invoiceData.createdBy),
                updatedBy: new ObjectId(invoiceData.createdBy),
            };
            console.log("Data = ", data);

            const invoice = await this.invoiceRepository.createInvoice(companyId, companyName, data);
            console.log("Party = ", party);
            console.log("Created Invoice = ", invoice);
            res.status(201).json(invoice);
        } catch (error) {
            console.error("Error in createInvoice:", error);
            res.status(500).json({ message: error.message });
        }
    }






    async getInvoiceById(req, res) {
        try {
            const rawInvoiceId = req.params.id;
            const rawCompanyId = req.params.companyId;
            const invoiceId = typeof rawInvoiceId === "string" ? rawInvoiceId.replace(/^"+|"+$/g, "") : rawInvoiceId;
            const companyId = typeof rawCompanyId === "string" ? rawCompanyId.replace(/^"+|"+$/g, "") : rawCompanyId;

            if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
                return res.status(400).json({ message: "Invalid invoice ID" });
            }
            if (!mongoose.Types.ObjectId.isValid(companyId)) {
                return res.status(400).json({ message: "Invalid company ID" });
            }

            const companyName = await getCompanyNameById(companyId);
            console.log(invoiceId)
            const invoice = await this.invoiceRepository.getInvoiceById(companyId, companyName, invoiceId);

            if (!invoice) {
                return res.status(404).json({ message: "Invoice not found" });
            }

            console.log("Invoice found in controller :", invoice);
            res.status(200).json(invoice);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }




    async updateInvoice(req, res) {
        // try {
        //     const invoiceId = req.params.id;
        //     const invoiceData = req.body;
        //      const companyName = await getCompanyNameById(req.params.companyId);
        //     // console.log("Invoice Data: " , invoiceData);
        //      const party = await PartyRepository.getPartyByName(
        //         req.params.companyId,
        //         companyName,
        //         invoiceData?.customer?.name // Pass only the name string
        //     );
        //     if (!party) {
        //         return res.status(400).json({ message: "Party not found" });
        //     }
        //     const services = await Promise.all(
        //         invoiceData.items.map(async (item) => {
        //             const service = await ServiceRepository.getServiceByName(req.params.companyId, companyName, item.service);
        //             // console.log("Service = ", service)
        //             return {
        //                 serviceId: new ObjectId(service._id),
        //                 amount: item?.price,
        //                 vehicleNum: item?.name || "",
        //             };
        //         })
        //     );
        //     // console.log(services)
        //     if( invoiceData.pendingAmount === 0 || invoiceData.pendingAmount < 0){
        //         invoiceData.status = "Paid";
        //     } else {
        //         invoiceData.status = "Pending";
        //     }
        //     const data = {
        //         partyId: new ObjectId(party._id),
        //         services,
        //         totalAmount: invoiceData.totalAmount,
        //         invoiceDate: invoiceData.invoiceDate,
        //         paidAmount: invoiceData.paidAmount,
        //         pendingAmount: invoiceData.pendingAmount,
        //         mobile: invoiceData.customer.mobile, // Assuming customer.mobile is passed in the request body
        //         status: invoiceData.status,
        //         createdBy: new ObjectId(invoiceData.createdBy),
        //     }
        //     // console.log(data);

        //     const updatedInvoice = await this.invoiceRepository.updateInvoice(req.params.companyId, companyName, invoiceId, data);
        //     console.log("Saved Invoice in Controller :", updatedInvoice)
        //     res.status(200).json(updatedInvoice);
        // } catch (error) {
        //     console.log(error)
        //     res.status(404).json({ message: error.message });
        // }

        try {
            const rawInvoiceId = req.params.id;
            const rawCompanyId = req.params.companyId;
            const invoiceId = typeof rawInvoiceId === "string" ? rawInvoiceId.replace(/^"+|"+$/g, "") : rawInvoiceId;
            const companyId = typeof rawCompanyId === "string" ? rawCompanyId.replace(/^"+|"+$/g, "") : rawCompanyId;
            const invoiceData = req.body;

            if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
                return res.status(400).json({ message: "Invalid invoice ID" });
            }
            if (!mongoose.Types.ObjectId.isValid(companyId)) {
                return res.status(400).json({ message: "Invalid company ID" });
            }

            const companyName = await getCompanyNameById(companyId);

            console.log("Invoice Data: ", invoiceData);
            let party = null;
            if (invoiceData?.partyId && typeof invoiceData.partyId === "string" && mongoose.Types.ObjectId.isValid(invoiceData.partyId)) {
                party = { _id: invoiceData.partyId };
            } else {
                party = await PartyRepository.getPartyByName(companyId, companyName, invoiceData?.customer?.name || invoiceData?.partyId?.partyName || invoiceData?.partyId);
            }
            if (!party) return res.status(400).json({ message: "Party not found" });

            // Map Services
            let services;
            if (Array.isArray(invoiceData.services) && invoiceData.services.length > 0) {
                services = await Promise.all(
                    invoiceData.services.map(async (item) => {
                        let serviceIdentifier = item?.serviceId || item?.serviceName || item?.service;
                        if (typeof serviceIdentifier === "object") {
                            serviceIdentifier = serviceIdentifier._id || serviceIdentifier.serviceName || serviceIdentifier.name;
                        }

                        let serviceIdValue;
                        if (typeof serviceIdentifier === "string" && mongoose.Types.ObjectId.isValid(serviceIdentifier)) {
                            serviceIdValue = new ObjectId(serviceIdentifier);
                        } else if (serviceIdentifier) {
                            const service = await ServiceRepository.getServiceByName(companyId, companyName, serviceIdentifier);
                            serviceIdValue = new ObjectId(service._id);
                        } else {
                            throw new Error("Service identifier is missing or invalid for one of the service items");
                        }

                        return {
                            serviceId: serviceIdValue,
                            amount: Number(item.amount || item.price || 0),
                            vehicleNum: item.vehicleNum || item.name || item?.vehicleNum || "",
                        };
                    })
                );
            }

            // Map Invoice Items
            let items;
            const rawItems = Array.isArray(invoiceData.items) ? invoiceData.items : Array.isArray(invoiceData.inventoryItems) ? invoiceData.inventoryItems : [];
            if (rawItems.length > 0) {
                items = await Promise.all(
                    rawItems.map(async (invItem) => {
                        let itemIdentifier = invItem?.itemId || invItem?.name || invItem?.itemName;
                        if (typeof itemIdentifier === "object") {
                            itemIdentifier = itemIdentifier._id || itemIdentifier?.itemId || itemIdentifier.name;
                        }

                        let itemIdValue;
                        if (typeof itemIdentifier === "string" && mongoose.Types.ObjectId.isValid(itemIdentifier)) {
                            itemIdValue = new ObjectId(itemIdentifier);
                        } else if (itemIdentifier) {
                            const itemMaster = await this.itemRepository.getItemByName(companyId, companyName, itemIdentifier);
                            itemIdValue = new ObjectId(itemMaster._id);
                        } else {
                            throw new Error(`Item identifier is missing or invalid for item ${invItem?.name || invItem?.itemName || "unknown"}`);
                        }

                        const quantity = Number(invItem.itemQuantity || invItem.quantity || invItem.qty || 0);
                        const price = Number(invItem.itemPrice || invItem.rate || invItem.price || 0);
                        return {
                            itemId: itemIdValue,
                            itemQuantity: quantity,
                            itemPrice: price,
                            total: Number(invItem.total || quantity * price),
                        };
                    })
                );
            }

            const status = invoiceData.pendingAmount <= 0 ? "Paid" : "Pending";

            const data = {
                partyId: new ObjectId(party._id),
                services,
                items,
                totalAmount: Number(invoiceData.totalAmount),
                invoiceDate: invoiceData.invoiceDate,
                paidAmount: Number(invoiceData.paidAmount),
                pendingAmount: Number(invoiceData.pendingAmount),
                mobile: invoiceData?.customer?.mobile || invoiceData?.partyId?.contactNumber || invoiceData.mobile,
                status,
                updatedBy: new ObjectId(invoiceData.updatedBy || invoiceData.createdBy),
            };

            const updatedInvoice = await this.invoiceRepository.updateInvoice(companyId, companyName, invoiceId, data);
            console.log("Saved Invoice in Controller :", updatedInvoice);
            res.status(200).json(updatedInvoice);
        } catch (error) {
            console.error("Error in updateInvoice:", error);
            res.status(404).json({ message: error.message });
        }
    }
    async deleteInvoice(req, res) {
        try {
            const invoiceId = req.params.id;
            const companyName = await getCompanyNameById(req.params.companyId);
            console.log("Invoice ID in deleteInvoice:", invoiceId);
            if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
                return res.status(400).json({ message: "Invalid invoice ID" });
            }
            console.log("Company Name in deleteInvoice:", companyName);
            if (!companyName) {
                return res.status(404).json({ message: "Company not found" });
            }
            const deletedInvoice = await this.invoiceRepository.deleteInvoice(req.params.companyId, companyName, invoiceId);
            res.status(200).json(deletedInvoice);
        } catch (error) {
            console.log("Error in Controller = ", error);
            res.status(404).json({ message: error.message });
        }
    }
    async getAllInvoices(req, res) {
        try {
            const companyName = await getCompanyNameById(req.params.companyId);
            console.log("companyName while getting invoices = ", companyName)
            const invoices = await this.invoiceRepository.getAllInvoices(req.params.companyId, companyName);
            console.log("Invoices while getting invoices = ", invoices);
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


        // const { companyId: companyIdStr } = req.params;
        // // Only proceed if companyId is a valid ObjectId
        // if (typeof companyIdStr !== "string" || companyIdStr.length !== 24 || !/^[a-fA-F0-9]+$/.test(companyIdStr)) {
        //     return res.status(400).json({ message: "Invalid Company ID" });
        // }
        // const companyName = await getCompanyNameById(companyIdStr);
        // if (!companyName) {
        //     return res.status(404).json({ message: "Company not found" });
        // }
        // const userName = req.query.userName?.trim();
        // if (!userName) {
        //     return res.status(400).json({ message: "User name is required" });
        // }
        // const now = dayjs();
        // const year = now.format("YYYY");
        // const initials = getInitialsFromName(userName);
        // if (!initials) {
        //     return res.status(400).json({ message: "Invalid user name for generating initials" });
        // }
        // const dbCompanyName = companyName.toLowerCase().replace(/\s+/g, "") + "_" + companyIdStr;
        // const dbName = `${dbCompanyName}`;
        // const companyDb = mongoose.connection.useDb(dbName, { useCache: true });
        // const nextSeq = await getNextBillNo(companyDb, companyIdStr, initials, year);
        // const countStr = String(nextSeq).padStart(2, "0");
        // const billNo = `${initials}-${year}-${countStr}`;
        // return res.status(200).json({ billNo });
    }

    // async getGeneratedBillNo(req, res) {
    //     try {
    //         const companyId = new ObjectId(req.params.companyId);
    //         if (!companyId) {
    //             return res.status(400).json({ message: "Company ID is required" });
    //         }
    //         const companyName = await getCompanyNameById(req.params.companyId);
    //         if (!companyName) {
    //             return res.status(404).json({ message: "Company not found" });
    //         }
    //         const userName = req.query.userName || "";
    //         if (!userName) {
    //             return res.status(400).json({ message: "User name is required" });
    //         }
    //         const now = dayjs();
    //         const year = now.format("YYYY");
    //         const initials = getInitialsFromName(userName);
    //         console.log("Initials:", initials);
    //         if (!initials) {
    //             return res.status(400).json({ message: "Invalid user name for generating initials" });
    //         }
    //         let dbCompanyName = companyName.toLowerCase().replace(/\s+/g, "") + "_" + companyId;
    //         let dbName = `${dbCompanyName}`;
    //         // Get company DB using mongoose directly
    //         const companyDb = mongoose.connection.useDb(dbName, { useCache: true });
    //         console.log("Company DB:", companyDb.name);
    //         if (!companyDb) {
    //             return res.status(500).json({ message: "Failed to connect to company database" });
    //         }
    //         // Use counter collection for atomic increment
    //         const nextSeq = await getNextBillNo(companyDb, companyId, initials, year);
    //         console.log("Next Sequence Number:", nextSeq);
    //         if (nextSeq === null || nextSeq === undefined) {
    //             return res.status(500).json({ message: "Failed to generate bill number" });
    //         }
    //         const countStr = String(nextSeq).padStart(2, '0');
    //         const billNo = `${initials}-${year}-${countStr}`;
    //         console.log("Generated Bill No:", billNo);
    //         res.status(200).json({ billNo });
    //     } catch (error) {
    //         console.error("Error generating bill number:", error);
    //         res.status(500).json({ message: error.message });
    //     }
    // }

}
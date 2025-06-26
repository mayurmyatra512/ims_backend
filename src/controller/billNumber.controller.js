
import InvoiceRepository from "../repository/invoices.repository.js";
import { getInitialsFromName } from "../utils/companyNameUtil.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";


export default class BillNumberController {
    constructor() {
        this.invoiceRepository = new InvoiceRepository();
    }

    async getGeneratedBillNo(req, res) {
        try {
            const companyId = req.params.companyId;
            console.log("Company ID:", companyId);
            const userName = req.query.userName?.trim();
            console.log("User Name:", userName);
            // Validate companyId
            if (!companyId || !ObjectId.isValid(companyId) || companyId.length !== 24 || !/^[a-fA-F0-9]+$/.test(companyId)) {
                return res.status(400).json({ message: "Invalid Company ID" });
            }
            if (!userName || typeof userName !== 'string' || userName.trim() === '') {
                return res.status(400).json({ message: "User name is required" });
            }
            const billNo = await this.invoiceRepository.getNextInvoiceNumber(
                companyId,
                dayjs().format("YYYY"),
                getInitialsFromName(userName)
            );
            console.log("Generated Bill Number:", billNo);
            if (!billNo) {
                return res.status(500).json({ message: "Failed to generate bill number" });
            }
            return res.status(200).json({ billNo });
        } catch (error) {
            console.error("Error generating bill number:", error);
            return res.status(500).json({ message: error.message });
        }

    }
}
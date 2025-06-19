import InvoiceModel from "../models/invoices.schema.js";
import PartyModel from "../models/parties.schema.js";
import ServiceModel from "../models/services.schema.js";


export default class DashboardRepository {
    async countInvoices(){
        try {
             return await InvoiceModel.countDocuments();
        } catch (error) {
            console.log("Error in Repository", error);
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }

     async countParties(){
        try {
             return await PartyModel.countDocuments();
        } catch (error) {
            console.log("Error in Repository", error);
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }

     async countServices(){
        try {
            return await ServiceModel.countDocuments();
        } catch (error) {
            console.log("Error in Repository", error);
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }

     async getTotalRevenue(){
        try {
             const result = await InvoiceModel.aggregate([
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            return result[0]?.total || 0;
        } catch (error) {
            console.log("Error in Repository", error);
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }

     async getRecentInvoices(limit = 5){
        try {
              const invoices = await InvoiceModel.find()
                .sort({ invoiceDate: -1 })
                .limit(limit)
                .populate({ path: "partyId", select: "partyName" });
            // Format as required
            return invoices.map(inv => ({
                _id: inv._id,
                invoiceNumber: inv.invoiceNumber,
                partyId: inv.partyId ? { partyName: inv.partyId.partyName } : null,
                date: inv.invoiceDate,
                totalAmount: inv.totalAmount
            }));
        } catch (error) {
            console.log("Error in Repository", error);
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }
}
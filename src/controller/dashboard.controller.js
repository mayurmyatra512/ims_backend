import DashboardRepository from "../repository/dashboard.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class DashboardController {
    constructor() {
        this.DashboardRepository = new DashboardRepository()
    }
    async getSummary(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            // Get total counts
            const totalInvoices = await this.DashboardRepository.countInvoices(companyId, companyName);
            const totalParties = await this.DashboardRepository.countParties(companyId, companyName);
            const totalServices = await this.DashboardRepository.countServices(companyId, companyName);
            // Calculate total revenue (sum of all invoices' totalAmount)
            const totalRevenue = await this.DashboardRepository.getTotalRevenue(companyId, companyName);
            // Get recent invoices (latest 5)
            const recentInvoices = await this.DashboardRepository.getRecentInvoices(companyId, companyName, 5);
            const data = {
                totalInvoices,
                totalParties,
                totalServices,
                totalRevenue,
                recentInvoices
            }
            console.log(data);
            res.status(200).json({
                totalInvoices,
                totalParties,
                totalServices,
                totalRevenue,
                recentInvoices
            });
        } catch (error) {
            console.log("Error in Controller = ", error)
            res.status(500).json({ message: error.message });
        }
    }
}
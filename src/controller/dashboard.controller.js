import DashboardRepository from "../repository/dashboard.repository.js";

export default class DashboardController {
    constructor() {
        this.DashboardRepository = new DashboardRepository()
    }
    async getSummary(req, res) {
        try {
            // Get total counts
            const totalInvoices = await this.DashboardRepository.countInvoices();
            const totalParties = await this.DashboardRepository.countParties();
            const totalServices = await this.DashboardRepository.countServices();
            // Calculate total revenue (sum of all invoices' totalAmount)
            const totalRevenue = await this.DashboardRepository.getTotalRevenue();
            // Get recent invoices (latest 5)
            const recentInvoices = await this.DashboardRepository.getRecentInvoices(5);
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
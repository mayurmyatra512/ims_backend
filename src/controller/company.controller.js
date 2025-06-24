import CompanyRepository from "../repository/company.repository.js";
import { registerCompany } from "../config/tenantManager.js";

export default class CompayController{
    constructor() {
        this.companyRepository = new CompanyRepository();
    }
    async createCompany(req, res) {
        try {
            const companyData = req.body;
            console.log(companyData)
            const company = await this.companyRepository.createCompany(companyData);
            console.log("Company created: ", company);
            // Register tenant collections after company is created
            await registerCompany({
                companyId: company._id.toString(),
                companyName: company.companyName
            });
            res.status(201).json(company);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(500).json({ message: error.message });
        }
    }
    async getCompanyById(req, res){
        try {
            const companyId = req.params.id;
            const company = await this.companyRepository.getCompanyById(companyId);
            res.status(200).json(company);            
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async updateCompany(req,res){
        try {
            const companyId = req.params.id;
            const companyData = req.body;
            const updatedCompany = await this.companyRepository.updateCompany(companyId, companyData);
            res.status(200).json(updatedCompany);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async deleteCompany(req, res){
        try {
            const companyId = req.params.id;
            const deletedCompany = await this.companyRepository.deleteCompany(companyId);
            res.status(200).json(deletedCompany);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async getAllCompanies(req,res){
        try {
            const companies = await this.companyRepository.getAllCompanies();
            res.status(200).json(companies);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
        }
    }
}
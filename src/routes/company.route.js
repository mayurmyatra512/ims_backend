import { Router } from "express";
import CompanyController from "../controller/company.controller.js";
import authMiddleware from "../middleware/auth.js";

const companyController = new CompanyController();
const companyRouter = Router();
// Define routes for company operations
companyRouter.post("/",  (req, res) => companyController.createCompany(req, res));
companyRouter.get("/:id",  (req, res) => companyController.getCompanyById(req, res));
companyRouter.put("/:id",  (req, res) => companyController.updateCompany(req, res));
companyRouter.delete("/:id",  (req, res) => companyController.deleteCompany(req, res));
companyRouter.get("/",  (req, res) => companyController.getAllCompanies(req, res));

export default companyRouter;
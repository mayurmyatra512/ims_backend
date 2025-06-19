import { Router } from "express";
import CompanyController from "../controller/company.controller.js";
import authMiddleware from "../middleware/auth.js";

const companyController = new CompanyController();
const companyRouter = Router();
// Define routes for company operations
companyRouter.post("/", authMiddleware, (req, res) => companyController.createCompany(req, res));
companyRouter.get("/:id", authMiddleware, (req, res) => companyController.getCompanyById(req, res));
companyRouter.put("/:id", authMiddleware, (req, res) => companyController.updateCompany(req, res));
companyRouter.delete("/:id", authMiddleware, (req, res) => companyController.deleteCompany(req, res));
companyRouter.get("/", authMiddleware, (req, res) => companyController.getAllCompanies(req, res));

export default companyRouter;
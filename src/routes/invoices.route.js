import InvoicesController from "../controller/invoices.controller.js";
import { getCompanyModel } from "../config/tenantManager.js";

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
const invoicesController = new InvoicesController();
const invoicesRouter = Router();
// Define routes for invoice operations
invoicesRouter.post("/:companyId", authMiddleware, (req, res) => invoicesController.createInvoice(req, res));
invoicesRouter.get("/:companyId/:id", authMiddleware, (req, res) => invoicesController.getInvoiceById(req, res));
invoicesRouter.put("/:companyId/:id", authMiddleware, (req, res) => invoicesController.updateInvoice(req, res));
invoicesRouter.delete("/:companyId/:id", authMiddleware, (req, res) => invoicesController.deleteInvoice(req, res));
invoicesRouter.get("/:companyId", authMiddleware, (req, res) => invoicesController.getAllInvoices(req, res));
invoicesRouter.get("/:companyId/number/:number", authMiddleware, (req, res) => invoicesController.getInvoiceByNumber(req, res));
// invoicesRouter.get("/")

export default invoicesRouter;
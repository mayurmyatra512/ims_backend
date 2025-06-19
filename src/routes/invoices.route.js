import InvoicesController from "../controller/invoices.controller.js";

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
const invoicesController = new InvoicesController();
const invoicesRouter = Router();
// Define routes for invoice operations
invoicesRouter.post("/", authMiddleware,  (req, res) => invoicesController.createInvoice(req, res));
invoicesRouter.get("/:id", authMiddleware,  (req, res) => invoicesController.getInvoiceById(req, res));
invoicesRouter.put("/:id", authMiddleware,  (req, res) => invoicesController.updateInvoice(req, res));
invoicesRouter.delete("/:id", authMiddleware,  (req, res) => invoicesController.deleteInvoice(req, res));
invoicesRouter.get("/", authMiddleware,  (req, res) => invoicesController.getAllInvoices(req, res));
invoicesRouter.get("/number/:number", authMiddleware,  (req, res) => invoicesController.getInvoiceByNumber(req, res));
// invoicesRouter.get("/")

export default invoicesRouter;
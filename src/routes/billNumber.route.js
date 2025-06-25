import InvoicesController from "../controller/invoices.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const invoicesController = new InvoicesController();
const billNumberRouter = Router();


// Define routes for invoice operations
billNumberRouter.get("/:companyId", authMiddleware, (req, res) =>
  invoicesController.getGeneratedBillNo(req, res)
);

export default billNumberRouter;
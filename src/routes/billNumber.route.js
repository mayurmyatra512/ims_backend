import InvoicesController from "../controller/invoices.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const invoicesController = new InvoicesController();
const billRouter = Router();


// Define routes for invoice operations
billRouter.get("/:companyId", authMiddleware, (req, res) =>
  invoicesController.getGeneratedBillNo(req, res)
);

export default billRouter;
// File: src/routes/billNumber.route.js
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import BillNumberController from "../controller/billNumber.controller.js";

const billNumberController = new BillNumberController();
const billNumberRouter = Router();


// Define routes for invoice operations
billNumberRouter.get("/:companyId", authMiddleware, (req, res) =>
  billNumberController.getGeneratedBillNo(req, res)
);

export default billNumberRouter;
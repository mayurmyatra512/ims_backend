import DashboardController from "../controller/dashboard.controller.js";
import { getCompanyModel } from "../config/tenantManager.js";

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
const dashboardController = new DashboardController();
const dashboardRouter = Router();

// Define routes for invoice operations
dashboardRouter.get("/:companyId/summary", authMiddleware, (req, res) => dashboardController.getSummary(req, res));
// dashboardRouter.get("/")

export default dashboardRouter;
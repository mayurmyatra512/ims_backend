import { Router } from "express";
import BankController from "../controller/bank.controller.js";
import authMiddleware from "../middleware/auth.js";

const bankController = new BankController();
const bankRouter = Router();

// Define routes for company operations
bankRouter.post("/", authMiddleware, (req, res) => bankController.createBank(req, res));
bankRouter.get("/:id", authMiddleware, (req, res) => bankController.getBankById(req, res));
bankRouter.put("/:id", authMiddleware, (req, res) => bankController.updateBank(req, res));
bankRouter.delete("/:id", authMiddleware, (req, res) => bankController.deleteBank(req, res));
bankRouter.get("/", authMiddleware, (req, res) => bankController.getAllBanks(req, res));

export default bankRouter;
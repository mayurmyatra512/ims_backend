import { ItemBatchController } from "../controller/itemBatch.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";


const itemsBatchController = new ItemBatchController();
const itemBatchRouter = Router();

itemBatchRouter.post("/:companyId", authMiddleware, (req, res) => itemsBatchController.createBatch(req, res));
itemBatchRouter.get("/:companyId/:id", authMiddleware, (req, res) => itemsBatchController.getBatchById(req, res));
itemBatchRouter.put("/:companyId/:id", authMiddleware, (req, res) => itemsBatchController.updateBatch(req, res));
itemBatchRouter.delete("/:companyId/:id", authMiddleware, (req, res) => itemsBatchController.deleteBatch(req, res));
itemBatchRouter.get("/:companyId/:id", authMiddleware, (req, res) => itemsBatchController.getBatchById(req, res));
itemBatchRouter.get("/:companyId", authMiddleware, (req, res) => itemsBatchController.getAllBatches(req, res));
itemBatchRouter.get("/:companyId/name/:name", authMiddleware, (req, res) => itemsBatchController.getBatchByName(req, res));
itemBatchRouter.get("/:companyId/company/:companyId", authMiddleware, (req, res) => itemsBatchController.getBatchesByCompanyId(req, res));

export default itemBatchRouter;

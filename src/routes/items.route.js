import ItemsController from "../controller/items.controller.js";

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";


const itemsController = new ItemsController();
const itemRouter = Router();

itemRouter.post("/", authMiddleware, (req, res) => itemsController.createItem(req, res));
itemRouter.get("/:id", authMiddleware, (req, res) => itemsController.getItemById(req, res));
itemRouter.put("/:id", authMiddleware, (req, res) => itemsController.updateItem(req, res));
itemRouter.delete("/:id", authMiddleware, (req, res) => itemsController.deleteItem(req, res));
itemRouter.get("/", authMiddleware, (req, res) => itemsController.getAllItems(req, res));
itemRouter.get("/name/:name", authMiddleware, (req, res) => itemsController.getItemByName(req, res));
itemRouter.get("/company/:companyId", authMiddleware, (req, res) => itemsController.getItemsByPartyId(req, res));

export default itemRouter;

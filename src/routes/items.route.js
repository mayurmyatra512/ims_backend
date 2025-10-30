import ItemsController from "../controller/items.controller.js";

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";


const itemsController = new ItemsController();
const itemRouter = Router();

itemRouter.post("/:companyId", authMiddleware, (req, res) => itemsController.createItem(req, res));
itemRouter.get("/:companyId/:id", authMiddleware, (req, res) => itemsController.getItemById(req, res));
itemRouter.put("/:companyId/:id", authMiddleware, (req, res) => itemsController.updateItem(req, res));
itemRouter.delete("/:companyId/:id", authMiddleware, (req, res) => itemsController.deleteItem(req, res));
itemRouter.get("/:companyId/:id", authMiddleware, (req, res) => itemsController.getItemById(req, res));
itemRouter.get("/:companyId", authMiddleware, (req, res) => itemsController.getAllItems(req, res));
itemRouter.get("/:companyId/name/:name", authMiddleware, (req, res) => itemsController.getItemByName(req, res));
itemRouter.get("/:companyId/party/:partyId", authMiddleware, (req, res) => itemsController.getItemsByPartyId(req, res));

export default itemRouter;

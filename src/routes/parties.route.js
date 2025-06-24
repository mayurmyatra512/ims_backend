import PartiesController from "../controller/parties.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const partiesController = new PartiesController();
const partiesRouter = Router();

// Define routes for party operations
partiesRouter.post("/:companyId", authMiddleware, (req, res) => partiesController.createParty(req, res));
partiesRouter.get("/:companyId/:id", authMiddleware, (req, res) => partiesController.getPartyById(req, res));
partiesRouter.put("/:companyId/:id", authMiddleware, (req, res) => partiesController.updateParty(req, res));
partiesRouter.delete("/:companyId/:id", authMiddleware, (req, res) => partiesController.deleteParty(req, res));
partiesRouter.get("/:companyId", authMiddleware, (req, res) => partiesController.getAllParties(req, res));
partiesRouter.get("/:companyId/name/:name", authMiddleware, (req, res) => partiesController.getPartyByName(req, res));
partiesRouter.get("/:companyId/contactNumber/:contactNumber", authMiddleware, (req, res) => partiesController.getPartyByContactNumber(req, res));

export default partiesRouter;
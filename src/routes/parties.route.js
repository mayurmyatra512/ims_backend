import PartiesController from "../controller/parties.controller.js";

const partiesController = new PartiesController();
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
const partiesRouter = Router();

// Define routes for party operations
partiesRouter.post("/", authMiddleware,  (req, res) => partiesController.createParty(req, res));
partiesRouter.get("/:id", authMiddleware,  (req, res) => partiesController.getPartyById(req, res));
partiesRouter.put("/:id", authMiddleware,  (req, res) => partiesController.updateParty(req, res));
partiesRouter.delete("/:id", authMiddleware,  (req, res) => partiesController.deleteParty(req, res));
partiesRouter.get("/", authMiddleware,  (req, res) => partiesController.getAllParties(req, res));
partiesRouter.get("/name/:name", authMiddleware,  (req, res) => partiesController.getPartyByName(req, res));
partiesRouter.get("/contactNumber/:contactNumber", authMiddleware,  (req, res) => partiesController.getPartyByContactNumber(req, res));

export default partiesRouter;
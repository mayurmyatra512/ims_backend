import ServicesController from "../controller/services.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const servicesController = new ServicesController();
const servicesRouter = Router();
// Define routes for service operations
servicesRouter.post("/", authMiddleware, (req, res) => servicesController.createService(req, res));
servicesRouter.get("/:id", authMiddleware, (req, res) => servicesController.getServiceById(req, res));
servicesRouter.put("/:id", authMiddleware,  (req, res) => servicesController.updateService(req, res));
servicesRouter.delete("/:id", authMiddleware,  (req, res) => servicesController.deleteService(req, res));
servicesRouter.get("/", authMiddleware,  (req, res) => servicesController.getAllServices(req, res));
servicesRouter.get("/name/:name", authMiddleware,  (req, res) => servicesController.getServiceByName(req, res));
servicesRouter.get("/parties/:partyId", authMiddleware,  (req, res) => servicesController.getServicesByPartyId(req, res));
servicesRouter.get("/description/:description", authMiddleware,  (req, res) => servicesController.getServiceByDescription(req, res));

export default servicesRouter;
// servicesRouter.get("/parties/:partyId", servicesController.getServicesByPartyId.bind(servicesController));
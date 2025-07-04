import { Router } from "express";
import SettingController from "../controller/setting.controller.js";
import authMiddleware from "../middleware/auth.js";

const settingController = new SettingController();
const settingRouter = Router();

// Define routes for Setting operations
settingRouter.post("/", authMiddleware, (req, res) => settingController.createSetting(req, res));
settingRouter.get("/:id", authMiddleware, (req, res) => settingController.getSettingById(req, res));
settingRouter.put("/:id", authMiddleware, (req, res) => settingController.updateSetting(req, res));
settingRouter.delete("/:id", authMiddleware, (req, res) => settingController.deleteSetting(req, res));
settingRouter.get("/", authMiddleware, (req, res) => settingController.getAllSettings(req, res));
settingRouter.get("/company/:companyId", authMiddleware, (req, res) => settingController.getSettingByCompanyId(req, res));



export default settingRouter;

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import CategoriesController from "../controller/categories.controller.js";

const categoriesController = new CategoriesController();
const categoriesRouter = Router();

categoriesRouter.post("/:companyId", authMiddleware, (req, res) => categoriesController.createCategory(req, res));
categoriesRouter.put("/:companyId/:id", authMiddleware, (req, res) => categoriesController.updateCategory(req, res));
categoriesRouter.delete("/:companyId/:id", authMiddleware, (req, res) => categoriesController.deleteCategory(req, res));
categoriesRouter.get("/:companyId/:id", authMiddleware, (req, res) => categoriesController.getCategoryById(req, res));
categoriesRouter.get("/:companyId", authMiddleware, (req, res) => categoriesController.getAllCategories(req, res));

export default categoriesRouter;

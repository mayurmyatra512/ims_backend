import CategoriesController from "../controller/categories.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const categoriesRouter = Router();

categoriesRouter.post("/", authMiddleware, (req, res) => CategoriesController.createCategory(req, res));
categoriesRouter.get("/:id", authMiddleware, (req, res) => CategoriesController.getCategoryById(req, res));
categoriesRouter.put("/:id", authMiddleware, (req, res) => CategoriesController.updateCategory(req, res));
categoriesRouter.delete("/:id", authMiddleware, (req, res) => CategoriesController.deleteCategory(req, res));
categoriesRouter.get("/", authMiddleware, (req, res) => CategoriesController.getAllCategories(req, res));

export default categoriesRouter;

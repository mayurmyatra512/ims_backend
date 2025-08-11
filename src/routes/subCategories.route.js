
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import SubCategoriesController from "../controller/subCategories.controller.js";

const subcategoriesRouter = Router();
subcategoriesRouter.post("/", authMiddleware, (req, res) => SubCategoriesController.createSubcategory(req, res));
subcategoriesRouter.get("/:id", authMiddleware, (req, res) => SubCategoriesController.getSubcategoryById(req, res));
subcategoriesRouter.put("/:id", authMiddleware, (req, res) => SubCategoriesController.updateSubcategory(req, res));
subcategoriesRouter.delete("/:id", authMiddleware, (req, res) => SubCategoriesController.deleteSubcategory(req, res));
subcategoriesRouter.get("/", authMiddleware, (req, res) => SubCategoriesController.getAllSubcategories(req, res));

export default subcategoriesRouter;

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import SubCategoriesController from "../controller/subCategories.controller.js";

const subcategoriesRouter = Router();
const subCategoriesController = new SubCategoriesController();
subcategoriesRouter.post("/:companyId", authMiddleware, (req, res) => subCategoriesController.createSubcategory(req, res));
subcategoriesRouter.put("/:companyId/:id", authMiddleware, (req, res) => subCategoriesController.updateSubcategory(req, res));
subcategoriesRouter.delete("/:companyId/:id", authMiddleware, (req, res) => subCategoriesController.deleteSubcategory(req, res));
subcategoriesRouter.get("/:companyId/:id", authMiddleware, (req, res) => subCategoriesController.getSubcategoryById(req, res));
subcategoriesRouter.get("/:companyId", authMiddleware, (req, res) => subCategoriesController.getAllSubcategories(req, res));

export default subcategoriesRouter;
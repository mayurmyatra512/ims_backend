
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import BrandsController from "../controller/brand.controller.js";

const brandsController = new BrandsController();
const brandsRouter = Router();

brandsRouter.post("/:companyId", authMiddleware, (req, res) => brandsController.createBrand(req, res));
brandsRouter.put("/:companyId/:id", authMiddleware, (req, res) => brandsController.updateBrand(req, res));
brandsRouter.delete("/:companyId/:id", authMiddleware, (req, res) => brandsController.deleteBrand(req, res));
brandsRouter.get("/:companyId/:id", authMiddleware, (req, res) => brandsController.getBrandById(req, res));
brandsRouter.get("/:companyId", authMiddleware, (req, res) => brandsController.getAllBrands(req, res));

export default brandsRouter;

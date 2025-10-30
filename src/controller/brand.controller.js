import BrandRepository from "../repository/brand.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class BrandsController {
    async createBrand(req, res) {
        try {
            const brandData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const brand = await BrandRepository.createBrand(companyId, companyName, brandData);
            res.status(201).json(brand);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getBrandById(req, res) {
        try {
            const brandId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const brand = await BrandRepository.getBrandById(companyId, companyName, brandId);
            if (!brand) {
                return res.status(404).json({ message: `Brand with ID ${brandId} not found` });
            }
            res.status(200).json(brand);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateBrand(req, res) {
        try {
            const brandId = req.params.id;
            const brandData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const updatedBrand = await BrandRepository.updateBrand(companyId, companyName, brandId, brandData);
            res.status(200).json(updatedBrand);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteBrand(req, res) {
        try {
            const brandId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const deletedBrand = await BrandRepository.deleteBrand(companyId, companyName, brandId);
            res.status(200).json(deletedBrand);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllCategories(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const categories = await BrandRepository.getAllCategories(companyId, companyName);
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

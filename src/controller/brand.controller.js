import BrandRepository from "../repository/brand.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class BrandsController {
    async createBrand(req, res) {
        try {
            console.log("Data =", req.body);
            const brandData = req.body;
            const companyId = req.params.companyId;

            const companyName = await getCompanyNameById(companyId);
            console.log("Brand Data :", brandData, "Company ID:", companyId, "Company Name:", companyName);
            const brand = await BrandRepository.createBrand(companyId, companyName, brandData);
            res.status(201).json(brand);
        } catch (error) {
            console.error("Error creating brand:", error);
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

    async getAllBrands(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const brands = await BrandRepository.getAllBrands(companyId, companyName);
            console.log("Fetched Brands:", brands);
            res.status(200).json(brands);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

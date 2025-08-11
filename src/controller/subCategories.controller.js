import SubcategoryRepository from "../repository/subCategory.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class SubcategoriesController {
    async createSubcategory(req, res) {
        try {
            const subcategoryData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const subcategory = await SubcategoryRepository.createSubcategory(companyId, companyName, subcategoryData);
            res.status(201).json(subcategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSubcategoryById(req, res) {
        try {
            const subcategoryId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const subcategory = await SubcategoryRepository.getSubcategoryById(companyId, companyName, subcategoryId);
            if (!subcategory) {
                return res.status(404).json({ message: `Subcategory with ID ${subcategoryId} not found` });
            }
            res.status(200).json(subcategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateSubcategory(req, res) {
        try {
            const subcategoryId = req.params.id;
            const subcategoryData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const updatedSubcategory = await SubcategoryRepository.updateSubcategory(companyId, companyName, subcategoryId, subcategoryData);
            res.status(200).json(updatedSubcategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteSubcategory(req, res) {
        try {
            const subcategoryId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const deletedSubcategory = await SubcategoryRepository.deleteSubcategory(companyId, companyName, subcategoryId);
            res.status(200).json(deletedSubcategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllSubcategories(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const subcategories = await SubcategoryRepository.getAllSubcategories(companyId, companyName);
            res.status(200).json(subcategories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

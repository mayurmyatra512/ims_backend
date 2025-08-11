import CategoryRepository from "../repository/category.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class CategoriesController {
    async createCategory(req, res) {
        try {
            const categoryData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const category = await CategoryRepository.createCategory(companyId, companyName, categoryData);
            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCategoryById(req, res) {
        try {
            const categoryId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const category = await CategoryRepository.getCategoryById(companyId, companyName, categoryId);
            if (!category) {
                return res.status(404).json({ message: `Category with ID ${categoryId} not found` });
            }
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const categoryId = req.params.id;
            const categoryData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const updatedCategory = await CategoryRepository.updateCategory(companyId, companyName, categoryId, categoryData);
            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const deletedCategory = await CategoryRepository.deleteCategory(companyId, companyName, categoryId);
            res.status(200).json(deletedCategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllCategories(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const categories = await CategoryRepository.getAllCategories(companyId, companyName);
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

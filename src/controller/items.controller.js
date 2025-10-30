import ItemRepository from "../repository/items.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class ItemsController {
    async createItem(req, res) {
        try {
            const itemData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const item = await ItemRepository.createItem(companyId, companyName, itemData);
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getItemById(req, res) {
        try {
            const itemId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const item = await ItemRepository.getItemById(companyId, companyName, itemId);
            if (!item) {
                return res.status(404).json({ message: `Item with ID ${itemId} not found` });
            }
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getAllItems(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);

            const filter = req.query || {};
            const items = await ItemRepository.getAllItems(companyId, companyName, filter);

            return res.status(200).json({
                success: true,
                message: "Items fetched successfully",
                data: items,
            });
        } catch (error) {
            console.error("❌ getAllItems error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateItem(req, res) {
        try {
            const itemId = req.params.id;
            const itemData = req.body;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const updatedItem = await ItemRepository.updateItem(companyId, companyName, itemId, itemData);
            res.status(200).json(updatedItem);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteItem(req, res) {
        try {
            const itemId = req.params.id;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const deletedItem = await ItemRepository.deleteItem(companyId, companyName, itemId);
            res.status(200).json(deletedItem);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // async getAllItems(req, res) {
    //     try {
    //         const companyId = req.params.companyId;
    //         const companyName = await getCompanyNameById(companyId);
    //         const items = await ItemRepository.getAllItems(companyId, companyName);
    //         res.status(200).json(items);
    //     } catch (error) {
    //         res.status(500).json({ message: error.message });
    //     }
    // }
    
    async getItemByName(req, res) {
        try {
            const itemName = req.params.name;
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const item = await ItemRepository.getItemByName(companyId, companyName, itemName);
            if (!item) {
                return res.status(404).json({ message: `Item with name ${itemName} not found` });
            }
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
import { ItemBatchRepository } from "../repositories/itemBatch.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";


export class ItemBatchController {
    /**
     * Create a new batch
     */
    static async createBatch(req, res) {
        try {

            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const batch = await ItemBatchRepository.createBatch(companyId, companyName, {
                ...req.body,
            });

            return res.status(201).json({
                success: true,
                message: "Item batch created successfully",
                data: batch,
            });
        } catch (error) {
            console.error("❌ createBatch error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get all batches
     */
    static async getAllBatches(req, res) {
        try {
             const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const filter = req.query || {};
            const batches = await ItemBatchRepository.getAllBatches(companyId, companyName, filter);

            return res.status(200).json({
                success: true,
                message: "Batches fetched successfully",
                data: batches,
            });
        } catch (error) {
            console.error("❌ getAllBatches error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get batch by ID
     */
    static async getBatchById(req, res) {
        try {
             const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);

            const batch = await ItemBatchRepository.getBatchById(
                companyId,
                companyName,
                req.params.batchId
            );

            if (!batch)
                return res.status(404).json({ success: false, message: "Batch not found" });

            return res.status(200).json({ success: true, data: batch });
        } catch (error) {
            console.error("❌ getBatchById error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Update batch
     */
    static async updateBatch(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const updated = await ItemBatchRepository.updateBatch(
                companyId,
                companyName,
                req.params.batchId,
                { ...req.body }
            );

            return res.status(200).json({
                success: true,
                message: "Batch updated successfully",
                data: updated,
            });
        } catch (error) {
            console.error("❌ updateBatch error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Delete batch
     */
    static async deleteBatch(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            await ItemBatchRepository.deleteBatch(companyId, companyName, req.params.batchId);

            return res.status(200).json({
                success: true,
                message: "Batch deleted successfully",
            });
        } catch (error) {
            console.error("❌ deleteBatch error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Adjust batch stock (increase/decrease)
     */
    static async adjustBatchStock(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const { batchId } = req.params;
            const { qtyChange } = req.body;

            const updatedBatch = await ItemBatchRepository.adjustBatchStock(
                companyId,
                companyName,
                batchId,
                qtyChange
            );

            return res.status(200).json({
                success: true,
                message: "Batch stock updated successfully",
                data: updatedBatch,
            });
        } catch (error) {
            console.error("❌ adjustBatchStock error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Add serial numbers to a batch
     */
    static async addSerialNumbers(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const { batchId } = req.params;
            const { serialNumbers } = req.body;

            const updatedBatch = await ItemBatchRepository.addSerialNumbers(
                companyId,
                companyName,
                batchId,
                serialNumbers
            );

            return res.status(200).json({
                success: true,
                message: "Serial numbers added successfully",
                data: updatedBatch,
            });
        } catch (error) {
            console.error("❌ addSerialNumbers error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Remove serial numbers
     */
    static async removeSerialNumbers(req, res) {
        try {
            const companyId = req.params.companyId;
            const companyName = await getCompanyNameById(companyId);
            const { batchId } = req.params;
            const { serialNumbers } = req.body;

            const updatedBatch = await ItemBatchRepository.removeSerialNumbers(
                companyId,
                companyName,
                batchId,
                serialNumbers
            );

            return res.status(200).json({
                success: true,
                message: "Serial numbers removed successfully",
                data: updatedBatch,
            });
        } catch (error) {
            console.error("❌ removeSerialNumbers error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

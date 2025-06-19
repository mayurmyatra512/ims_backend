import BankModel from "../models/bank.schema.js";

export default class BankRepository {
  async createBank(bankData) {
    try {
      const bank = new BankModel(bankData);
      await bank.save();
      return bank;
    } catch (error) {
      console.log("Error in Repository: ", error);
      throw new Error(`Error creating bank: ${error.message}`);
    }
  }

  async getBankById(bankId) {
    try {
      const bank = await BankModel.findById(bankId);
      if (!bank) {
        throw new Error(`bank with ID ${bankId} not found`);
      }
      return bank;
    } catch (error) {
      throw new Error(`Error fetching bank: ${error.message}`);
    }
  }

  async updateBank(bankId, bankData) {
    try {
      const bank = await BankModel.findByIdAndUpdate(
        bankId,
        { ...bankData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!bank) {
        throw new Error(`bank with ID ${bankId} not found`);
      }
      return bank;
    } catch (error) {
      throw new Error(`Error updating bank: ${error.message}`);
    }
  }

  async deleteBank(bankId) {
    try {
      const bank = await BankModel.findByIdAndDelete(bankId);
      if (!bank) {
        throw new Error(`bank with ID ${bankId} not found`);
      }
      return bank;
    } catch (error) {
      throw new Error(`Error deleting bank: ${error.message}`);
    }
  }

  async getAllBanks() {
    try {
      const banks = await BankModel.find();
      return banks;
    } catch (error) {
      throw new Error(`Error fetching banks: ${error.message}`);
    }
  }
}
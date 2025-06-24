import BankModel from "../models/bank.schema.js";
import CompanyModel from "../models/company.schema.js";

export default class BankRepository {
  async createBank(bankData) {
    try {
      const bank = new BankModel(bankData);
      await bank.save();
      // Update the corresponding company's bankId field
      await CompanyModel.findByIdAndUpdate(
        bank.companyId,
        { bankId: bank._id },
        { new: true }
      );
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

  async getBankByCompanyId(companyId) {
    try {
      // Find the company and get its bankId
      const company = await CompanyModel.findById(companyId);
      if (!company || !company.bankId) {
        throw new Error(`No bank found for company with ID ${companyId}`);
      }
      // Find the bank by the bankId stored in the company
      const bank = await BankModel.findById(company.bankId);
      if (!bank) {
        throw new Error(`Bank with ID ${company.bankId} not found`);
      }
      return bank;
    } catch (error) {
      throw new Error(`Error fetching bank by companyId: ${error.message}`);
    }
  }
}
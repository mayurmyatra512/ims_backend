import SettingModel from "../models/settings.schema.js";
import CompanyModel from "../models/company.schema.js";

export default class SettingRepository {
    async createSetting(settingData) {
        try {
            const setting = new SettingModel(settingData);
            await setting.save();
            // Update the corresponding company's bankId field
            await CompanyModel.findByIdAndUpdate(
                setting.companyId,
                { settingId: setting._id },
                { new: true }
            );
            return setting;
        } catch (error) {
            console.log("Error in Repository: ", error);
            throw new Error(`Error creating bank: ${error.message}`);
        }
    }

    async getSettingById(settingId) {
    try {
      const setting = await SettingModel.findById(settingId);
      if (!setting) {
        throw new Error(`setting with ID ${settingId} not found`);
      }
      return setting;
    } catch (error) {
      throw new Error(`Error fetching setting: ${error.message}`);
    }
  }

    async updateSetting(settingId, settingData) {
    try {
      const bank = await BankModel.findByIdAndUpdate(
        settingId,
        { ...settingData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!bank) {
        throw new Error(`bank with ID ${settingId} not found`);
      }
      return bank;
    } catch (error) {
      throw new Error(`Error updating bank: ${error.message}`);
    }
  }

    async deleteSetting(settingId) {
      try {
        const setting = await SettingModel.findByIdAndDelete(settingId);
        if (!setting) {
          throw new Error(`setting with ID ${settingId} not found`);
        }
        return setting;
      } catch (error) {
        throw new Error(`Error deleting setting: ${error.message}`);
      }
    }

     async getAllSettings() {
        try {
          const settings = await SettingModel.find();
          return settings;
        } catch (error) {
          throw new Error(`Error fetching settings: ${error.message}`);
        }
      }

     async getSettingByCompanyId(companyId) {
        try {
          // Find the company and get its settingId
          const company = await CompanyModel.findById(companyId);
          if (!company || !company.settingsId) {
            throw new Error(`No setting found for company with ID ${companyId}`);
          }
          // Find the setting by the settingId stored in the company
          const setting = await SettingModel.findById(company.settingsId);
          if (!setting) {
            throw new Error(`Setting with ID ${company.settingsId} not found`);
          }
          return setting;
        } catch (error) {
          throw new Error(`Error fetching setting by companyId: ${error.message}`);
        }
      }
}
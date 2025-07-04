import SettingRepository from "../repository/setting.repository.js";

export default class SettingController{
    constructor(){
        this.settingRepository = new SettingRepository()
    }

    async createSetting (req, res) {
        try {
            const settingData = req.body;
            console.log(settingData);
            const setting = await this.settingRepository.createSetting(settingData);
            res.status(201).json(setting);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(500).json({ message: error.message });
        }
    }

     async getSettingById(req, res){
        try {
            const settingId = req.params.id;
            const setting = await this.settingRepository.getSettingById(settingId);
            res.status(200).json(setting);            
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }

     async updateSetting(req,res){
        try {
            const settingId = req.params.id;
            const settingData = req.body;
            const updatedSetting = await this.settingRepository.updateSetting(settingId, settingData);
            res.status(200).json(updatedSetting);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }

    async deleteSetting(req, res){
        try {
            const settingId = req.params.id;
            const deletedSetting = await this.settingRepository.deleteSetting(settingId);
            res.status(200).json(deletedSetting);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async getAllSettings(req,res){
        try {
            const settings = await this.settingRepository.getAllSettings();
            res.status(200).json(settings);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
        }
    }
    static async getSettingByCompanyId(req, res) {
        try {
            const companyId = req.params.companyId;
            const setting = await this.settingRepository.getSettingByCompanyId(companyId);
            res.status(200).json(setting);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
        }
    }
}
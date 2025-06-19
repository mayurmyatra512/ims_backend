import BankRepository from "../repository/bank.repository.js";

export default class BankController{
    constructor() {
        this.bankRepository = new BankRepository();
    }
    async createBank(req, res) {
        try {
            const bankData = req.body;
            const bank = await this.bankRepository.createBank(bankData);
            res.status(201).json(bank);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(500).json({ message: error.message });
        }
    }
    async getBankById(req, res){
        try {
            const bankId = req.params.id;
            const bank = await this.bankRepository.bankRepository(bankId);
            res.status(200).json(bank);            
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async updateBank(req,res){
        try {
            const bankId = req.params.id;
            const bankData = req.body;
            const updatedBank = await this.bankRepository.updateBank(bankId, bankData);
            res.status(200).json(updatedBank);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async deleteBank(req, res){
        try {
            const bankId = req.params.id;
            const deletedBank = await this.bankRepository.deleteBank(bankId);
            res.status(200).json(deletedBank);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
            
        }
    }
    async getAllBanks(req,res){
        try {
            const banks = await this.bankRepository.getAllBanks();
            res.status(200).json(banks);
        } catch (error) {
            console.error("Error in Controller: ", error);
            res.status(404).json({ message: error.message });
        }
    }
}
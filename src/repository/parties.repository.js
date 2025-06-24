import mongoose from "mongoose";
import PartyModel from "../models/parties.schema.js";

function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class PartyRepository {
  static getPartyModel(companyId, companyName) {
     const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Party')) {
      companyDb.model('Party', PartyModel.schema, 'parties');
    }
    return companyDb.model('Party');
  }
  static async createParty(companyId, companyName, partyData) {
    const PartyModel = this.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    const party = new PartyModel(partyData);
    await party.save();
    return party;
  }
  static async getPartyById(companyId, companyName, partyId) {
    const PartyModel = this.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    const party = await PartyModel.findById(partyId);
    if (!party) throw new Error(`Party with ID ${partyId} not found`);
    return party;
  }
  static async updateParty(companyId, companyName, partyId, partyData) {
    const PartyModel = this.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    const party = await PartyModel.findByIdAndUpdate(
      partyId,
      { ...partyData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!party) throw new Error(`Party with ID ${partyId} not found`);
    return party;
  }
  static async deleteParty(companyId, companyName, partyId) {
    const PartyModel = this.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    const party = await PartyModel.findByIdAndDelete(partyId);
    if (!party) throw new Error(`Party with ID ${partyId} not found`);
    return party;
  }
  static async getAllParties(companyId, companyName) {
    const PartyModel = this.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    return await PartyModel.find();
  }

  static async getPartyByName(companyId, companyName, partyName) {
    const PartyModel = this.getPartyModel(companyId, companyName);
    if (!PartyModel) throw new Error("Party collection not found for this company");
    const party = await PartyModel.findOne({ partyName: partyName });
    if (!party) throw new Error(`Party with name ${partyName} not found`);
    return party;
  }
}


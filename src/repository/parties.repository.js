import PartyModel from "../models/parties.schema.js";

export default class PartyRepository {
  static async createParty(partyData) {
    try {
    
      const party = new PartyModel(partyData);
      await party.save();
      return party;
    } catch (error) {
        console.log("Error creating party in Repository:", error);
      throw new Error(`Error creating party in Repository: ${error.message}`);
    }
  }

  static async getPartyById(partyId) {
    try {
      const party = await PartyModel.findById(partyId);
      if (!party) {
        throw new Error(`Party with ID ${partyId} not found`);
      }
      return party;
    } catch (error) {
      throw new Error(`Error fetching party: ${error.message}`);
    }
  }

  static async updateParty(partyId, partyData) {
    try {
      const party = await PartyModel.findByIdAndUpdate(
        partyId,
        { ...partyData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!party) {
        throw new Error(`Party with ID ${partyId} not found`);
      }
      return party;
    } catch (error) {
      throw new Error(`Error updating party: ${error.message}`);
    }
  }

  static async deleteParty(partyId) {
    try {
      const party = await PartyModel.findByIdAndDelete(partyId);
      if (!party) {
        throw new Error(`Party with ID ${partyId} not found`);
      }
      return party;
    } catch (error) {
      throw new Error(`Error deleting party: ${error.message}`);
    }
  }

  static async getAllParties() {
    try {
      const parties = await PartyModel.find();
      return parties;
    } catch (error) {
      throw new Error(`Error fetching parties: ${error.message}`);
    }
  }

  static async getPartyByName(partyName) {
    try {
      const party = await PartyModel.findOne({ partyName });
      if (party.length === 0) {
        throw new Error(`Party with name ${partyName} not found`);
      }
      return party;
    } catch (error) {
      throw new Error(`Error fetching party by name: ${error.message}`);
    }
  }

  static async getPartyByContactNumber(contactNumber) {
    try {
      const party = await PartyModel.findOne({ contactNumber });
      if (!party) {
        throw new Error(`Party with contact number ${contactNumber} not found`);
      }
      return party;
    } catch (error) {
      throw new Error(`Error fetching party by contact number: ${error.message}`);
    }
  }
}


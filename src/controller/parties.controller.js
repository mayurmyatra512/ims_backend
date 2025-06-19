import PartyRepository from "../repository/parties.repository.js";

export default class PartiesController {
    // No constructor needed since all methods are static

    async createParty(req, res) {
        try {
            const partyData = req.body;
            if (!partyData.partyName || !partyData.partyType || !partyData.contactNumber) {
                return res.status(400).json({ message: "Name and contact number are required" });
            }
            // Validate other required fields as necessary
            const createdParty = await PartyRepository.createParty(partyData);
            res.status(201).json(createdParty);
        } catch (error) {
            console.error("Error creating party:", error);
            res.status(500).json({ message: error.message });
        }
    }

    async getPartyById(req, res) {
        try {
            const partyId = req.params.id;
            const foundParty = await PartyRepository.getPartyById(partyId);
            res.status(200).json(foundParty);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateParty(req, res) {
        try {
            const partyId = req.params.id;
            const partyData = req.body;
            console.log("PartyID = ", partyId)
            console.log("partyData = ", partyData)
            const updatedParty = await PartyRepository.updateParty(partyId, partyData);
            res.status(200).json(updatedParty);
        } catch (error) {
            console.log(error)
            res.status(404).json({ message: error.message });
        }
    }

    async deleteParty(req, res) {
        try {
            const partyId = req.params.id;
            const deletedParty = await PartyRepository.deleteParty(partyId);
            res.status(200).json(deletedParty);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async getAllParties(req, res) {
        try {
            const parties = await PartyRepository.getAllParties();
            res.status(200).json(parties);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPartyByName(req, res) {
        try {
            const partyName = req.params.name;
            const partiesByName = await PartyRepository.getPartyByName(partyName);
            if (!partiesByName) {
                return res.status(404).json({ message: `Party with name ${partyName} not found` });
            }
            res.status(200).json(partiesByName);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPartyByContactNumber(req, res) {
        try {
            const contactNumber = req.params.contactNumber;
            const partyByContact = await PartyRepository.getPartyByContactNumber(contactNumber);
            if (!partyByContact) {
                return res.status(404).json({ message: `Party with contact number ${contactNumber} not found` });
            }
            res.status(200).json(partyByContact);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
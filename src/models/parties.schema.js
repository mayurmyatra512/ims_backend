import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  partyName: {
    type: String,
    required: [true, "Please enter the party name"],
    trim: true,
  },
  partyType: {
    type: String,
    required: [true, "Please enter the party type"],
    enum: ["Individual", "Firm Name", "Other"],
  },
  contactInfo: {
    type: String,
    // required: [true, "Please enter a description for the party"],
  },
  address: {
    type: String,
    // required: [true, "Please enter the party address"],
  },
  contactNumber: {
    type: String,
    required: [true, "Please enter the party contact number"],
  },
  altContactNumber: {
    type: String,
    // required: [true, "Please enter an alternate contact number"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const PartyModel = mongoose.model("Party", partySchema);
export default PartyModel;
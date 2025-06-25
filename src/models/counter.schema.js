import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    year: { type: String, required: true },
    initials: { type: String, required: true },
    seq: { type: Number, default: 0 },
}, { collection: "counters" });

counterSchema.index({ companyId: 1, year: 1, initials: 1 }, { unique: true });

export default counterSchema;

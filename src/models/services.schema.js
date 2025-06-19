import mongoose from "mongoose"

const servicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, "Please enter the service name"],
    trim: true,
  },
  service: {
    type: String,
    required: [true, "Please enter a description for the service"],
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

const ServiceModel = mongoose.model("Service", servicesSchema, "mainCollection");
export default ServiceModel;
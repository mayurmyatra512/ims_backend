import mongoose from "mongoose";
import ServiceModel from "../models/services.schema.js";

function getCompanyDb(companyId, companyName) {
  let dbCompanyName = companyName ? companyName.toLowerCase().replace(/\s+/g, "") : "company";
  const dbName = `${dbCompanyName}_${companyId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
}

export default class ServiceRepository {
  static getServiceModel(companyId, companyName) {
    const companyDb = getCompanyDb(companyId, companyName);
    if (!companyDb) throw new Error("Company database not found");
    // Register the model if not already registered
    if (!companyDb.modelNames().includes('Service')) {
      companyDb.model('Service', ServiceModel.schema, 'services');
    }
    return companyDb.model('Service');
  }

  static async createService(companyId, companyName, serviceData) {
    const ServiceModel = this.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    const service = new ServiceModel(serviceData);
    await service.save();
    return service;
  }

  static async getServiceById(companyId, companyName, serviceId) {
    const ServiceModel = this.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    const service = await ServiceModel.findById(serviceId).populate("parties");
    if (!service) throw new Error(`Service with ID ${serviceId} not found`);
    return service;
  }

  static async updateService(companyId, companyName, serviceId, serviceData) {
    const ServiceModel = this.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    const service = await ServiceModel.findByIdAndUpdate(
      serviceId,
      { ...serviceData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!service) throw new Error(`Service with ID ${serviceId} not found`);
    return service;
  }

  static async deleteService(companyId, companyName, serviceId) {
    const ServiceModel = this.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    const service = await ServiceModel.findByIdAndDelete(serviceId);
    if (!service) throw new Error(`Service with ID ${serviceId} not found`);
    return service;
  }

  static async getAllServices(companyId, companyName) {
    const ServiceModel = this.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    return await ServiceModel.find();
  }

  static async getServiceByName(companyId, companyName, serviceName) {
    const ServiceModel = this.getServiceModel(companyId, companyName);
    if (!ServiceModel) throw new Error("Service collection not found for this company");
    const service = await ServiceModel.findOne({ serviceName });
    if (!service) throw new Error(`Service with name ${serviceName} not found`);
    return service;
  }
}



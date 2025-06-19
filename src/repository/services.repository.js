import ServiceModel from "../models/services.schema.js";

export default class ServiceRepository {
  static async createService(serviceData) {
    try {
      const service = new ServiceModel(serviceData);
      await service.save();
      return service;
    } catch (error) {
        console.log("Error in Controller: ", error);
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  static async getServiceById(serviceId) {
    try {
      const service = await ServiceModel
        .findById(serviceId)
        .populate("parties");
      if (!service) {
        throw new Error(`Service with ID ${serviceId} not found`);
      }
      return service;
    } catch (error) {
      throw new Error(`Error fetching service: ${error.message}`);
    }
  }

  static async updateService(serviceId, serviceData) {
    try {
      const service = await ServiceModel.findByIdAndUpdate(
        serviceId,
        { ...serviceData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!service) {
        throw new Error(`Service with ID ${serviceId} not found`);
      }
      return service;
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  static async deleteService(serviceId) {
    try {
      const service = await ServiceModel.findByIdAndDelete(serviceId);
      if (!service) {
        throw new Error(`Service with ID ${serviceId} not found`);
      }
      return service;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  static async getAllServices() {
    try {
      const services = await ServiceModel.find();
      return services;
    } catch (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }
  }

  static async getServiceByName(serviceName) {
    try {
      const service = await ServiceModel
        .findOne({ serviceName })
        // .populate("parties");
      if (!service) {
        throw new Error(`Service with name ${serviceName} not found`);
      }
      return service;
    } catch (error) {
      throw new Error(`Error fetching service by name: ${error.message}`);
    }
  }

  static async getServiceByDescription(service) {
    try {
      const service = await ServiceModel
        .findOne({ service: new RegExp(service, "i") })
        .populate("parties");
      if (!service) {
        throw new Error(`Service with description ${service} not found`);
      }
      return service;
    } catch (error) {
      throw new Error(`Error fetching service by description: ${error.message}`);
    }
  }
}



import ServiceService from "../repository/services.repository.js";
import { getCompanyNameById } from "../utils/companyNameUtil.js";

export default class ServicesController {
    // constructor() {
    //     this.serviceService = new ServiceService();
    // };
    async createService(req, res) {
        try {
            const serviceData = req.body;
            console.log("Service Data: ", serviceData);
            const companyName = await getCompanyNameById(req.params.companyId);
            console.log("Company Name: ", companyName);
            const service = await ServiceService.createService(req.params.companyId, companyName, serviceData);
            console.log("Service Created: ", service);
            res.status(201).json(service);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    async getServiceById(req, res) {
        try {
            const serviceId = req.params.id;
            const companyName = await getCompanyNameById(req.params.companyId);
            const service = await ServiceService.getServiceById(req.params.companyId, companyName, serviceId);
            res.status(200).json(service);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async updateService(req, res) {
        try {
            const serviceId = req.params.id;
            const serviceData = req.body;
            const companyName = await getCompanyNameById(req.params.companyId);
            const updatedService = await ServiceService.updateService(req.params.companyId, companyName, serviceId, serviceData);
            res.status(200).json(updatedService);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async deleteService(req, res) {
        try {
            const serviceId = req.params.id;
            const companyName = await getCompanyNameById(req.params.companyId);
            const deletedService = await ServiceService.deleteService(req.params.companyId, companyName, serviceId);
            res.status(200).json(deletedService);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async getAllServices(req, res) {
        try {
            const companyName = await getCompanyNameById(req.params.companyId);
            const services = await ServiceService.getAllServices(req.params.companyId, companyName);
            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    async getServiceByName(req, res) {
        try {
            const serviceName = req.params.name;
            const companyName = await getCompanyNameById(req.params.companyId);
            const service = await ServiceService.getServiceByName(req.params.companyId, companyName, serviceName);
            res.status(200).json(service);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async getServiceByPartyId(req, res) {
        try {
            const partyId = req.params.partyId;
            const companyName = await getCompanyNameById(req.params.companyId);
            const services = await ServiceService.getServiceByPartyId(req.params.companyId, companyName, partyId);
            res.status(200).json(services);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async getServicesByDescription(req, res) {
        try {
            const description = req.params.description;
            const companyName = await getCompanyNameById(req.params.companyId);
            const services = await ServiceService.getServicesByDescription(req.params.companyId, companyName, description);
            res.status(200).json(services);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
};
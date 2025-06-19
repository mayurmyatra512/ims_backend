import ServiceService from "../repository/services.repository.js";

export default class ServicesController {
    // constructor() {
    //     this.serviceService = new ServiceService();
    // };
    async createService(req, res) {
        try {
            const serviceData = req.body;
            const service = await ServiceService.createService(serviceData);
            res.status(201).json(service);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    async getServiceById(req, res) {
        try {
            const serviceId = req.params.id;
            const service = await ServiceService.getServiceById(serviceId);
            res.status(200).json(service);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async updateService(req, res) {
        try {
            const serviceId = req.params.id;
            const serviceData = req.body;
            const updatedService = await ServiceService.updateService(serviceId, serviceData);
            res.status(200).json(updatedService);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async deleteService(req, res) {
        try {
            const serviceId = req.params.id;
            const deletedService = await ServiceService.deleteService(serviceId);
            res.status(200).json(deletedService);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async getAllServices(req, res) {
        try {
            const services = await ServiceService.getAllServices();
            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    async getServiceByName(req, res) {
        try {
            const serviceName = req.params.name;
            const service = await ServiceService.getServiceByName(serviceName);
            res.status(200).json(service);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async getServiceByPartyId(req, res) {
        try {
            const partyId = req.params.partyId;
            const services = await ServiceService.getServiceByPartyId(partyId);
            res.status(200).json(services);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
    async getServicesByDescription(req, res) {
        try {
            const description = req.params.description;
            const services = await ServiceService.getServicesByDescription(description);
            res.status(200).json(services);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };

};
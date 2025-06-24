import CompanyRepository from "../repository/company.repository.js";

const companyRepository = new CompanyRepository();

export async function getCompanyNameById(companyId) {
    const company = await companyRepository.getCompanyById(companyId);
    if (!company) throw new Error(`Company with ID ${companyId} not found`);
    return company.companyName;
}

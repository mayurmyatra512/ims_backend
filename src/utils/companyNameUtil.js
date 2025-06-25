import CompanyRepository from "../repository/company.repository.js";

const companyRepository = new CompanyRepository();

export async function getCompanyNameById(companyId) {
    const company = await companyRepository.getCompanyById(companyId);
    if (!company) return null;
    return company.companyName;
}

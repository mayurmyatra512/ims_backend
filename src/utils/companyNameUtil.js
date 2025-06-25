import CompanyRepository from "../repository/company.repository.js";

const companyRepository = new CompanyRepository();

export async function getCompanyNameById(companyId) {
    // Only query if companyId is a valid ObjectId
    if (typeof companyId !== "string" || companyId.length !== 24 || !/^[a-fA-F0-9]+$/.test(companyId)) {
        return null;
    }
    const company = await companyRepository.getCompanyById(companyId);
    if (!company) return null;
    return company.companyName;
}

export function getInitialsFromName(name) {
    if (!name) return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0].toUpperCase())
        .join('');
}
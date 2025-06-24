import jwt from "jsonwebtoken";

// Always include companyId in the token for multi-tenant context
export const tokenGeneration = async (data, companyId) => {
    const secret = process.env.JWT_SECRET || "default_secret";
    const expiresIn = process.env.JWT_EXPIRATION || "1h";
    // Ensure companyId is present in the payload
    const payload = { ...data };
    if (companyId) payload.companyId = companyId;
    return jwt.sign(payload, secret, { expiresIn });
};

export const tokenVerify = async (token) => {
    const secret = process.env.JWT_SECRET || "default_secret";
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
};
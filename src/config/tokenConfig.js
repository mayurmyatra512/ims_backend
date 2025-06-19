import jwt from "jsonwebtoken";

export const tokenGeneration = async (data) => {
    const secret = process.env.JWT_SECRET || "default_secret";
    const expiresIn = process.env.JWT_EXPIRATION || "1h";
    return jwt.sign(data, secret, { expiresIn });
};

export const tokenVerify = async (token) => {
    const secret = process.env.JWT_SECRET || "default_secret";
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
};
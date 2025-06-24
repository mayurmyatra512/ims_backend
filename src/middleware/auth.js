import { tokenVerify } from "../config/tokenConfig.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Try to get token from Authorization header or cookie
        let token = null;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = await tokenVerify(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded;
        // Optionally, attach companyId for multi-tenant context
        if (decoded.companyId) {
            req.companyId = decoded.companyId;
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

export default authMiddleware;

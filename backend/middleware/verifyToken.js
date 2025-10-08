import jwt from "jsonwebtoken";

export function verifyToken(req,res,next) {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({success:false, message:"Unauthorised - no token provided"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({success:false, message:"Unauthorised - invalid token provided"});

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in verifyToken", error)
        return res.status(500).json({success:false, message:"Server Error"});
    }
}
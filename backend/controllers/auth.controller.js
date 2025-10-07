import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js"
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";

export async function signup(req,res){
    try {
        const {email, password, name} = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({success:false, message: "All fields are required"});
        };

        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({success:false, message: "User already exists"});
        };

        const hashed_password = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const newUser = new User({
            name, 
            email, 
            password:hashed_password,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hrs
        });
        
        await newUser.save();
        
        // jwt
        generateTokenAndSetCookie(res, newUser._id);

        await sendVerificationEmail(newUser.email, verificationToken);

        return res.status(201).json({success:true, message: "User created successfully", user:{...newUser._doc, password:undefined}});

    } catch (error) {
        return res.status(400).json({success:false, message: error.message});
    }
};

export async function verifyEmail(req,res) {
    const { code } = req.body;

	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
}

export async function login(req,res){
    
};

export async function logout(req,res){
    res.clearCookie("token");
    res.status(200).json({success:true, message:"Successfully logged out"})
};
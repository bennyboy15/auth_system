import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js"
import { sendVerificationEmail, sendWelcomeEmail, sendForgotPasswordEmail, sendResetSuccessEmail } from "../mailtrap/email.js";
import crypto from "crypto";

export async function signup(req,res){
    const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
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
};

export async function forgotPassword(req,res) { 
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if (!user) return res.status(404).json({success:false, message:"User not found!"});

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        await sendForgotPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
		res.status(200).json({ success: true, message: "Sent forgot password email" });

    } catch (error) {
		console.log("error in forgot password ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export async function resetPassword(req,res) {
    try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcrypt.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function login(req,res){
    try {
        const {email, password} = req.body;

        if (!email || !password) return res.status(400).json({success:false, message:"Email and password are required!"});

        const user = await User.findOne({email});
        if (!user) return res.status(404).json({success:false, message:"Invalid credentials"});

        const password_correct = await bcrypt.compare(password, user.password);
        if (!password_correct) return res.status(404).json({success:false, message:"Invalid credentials"});

        generateTokenAndSetCookie(res,user._id);
        user.lastLogin = new Date();
        await user.save();
        res.status(200).json({success:true, message:"Successfully logged in", user:{...user._doc, password:undefined}});

    } catch (error) {
        console.log("error in login ", error);
		res.status(500).json({ success: false, message: error.message });
    }
};

export async function logout(req,res){
    res.clearCookie("token");
    res.status(200).json({success:true, message:"Successfully logged out"})
};

export async function checkAuth(req,res) {
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user) return res.status(404).json({success:false, message:"User not found"});

        res.status(200).json({success:true, user});
    } catch (error) {
        console.log("error in checkAuth ", error);
		res.status(500).json({ success: false, message: error.message });
    }
}
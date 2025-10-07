import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js"
import { sendVerificationEmail } from "../mailtrap/email.js";

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

export async function login(req,res){
    
};

export async function logout(req,res){
    
};
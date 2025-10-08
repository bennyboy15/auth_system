import express from "express";
import { connectDB } from "./db/connectDB.js"
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

config();
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json()); // parse req.body as JSON
app.use(cookieParser()); // parse incoming cookies

app.use("/api/auth", authRoutes);

app.listen(PORT, ()=> {
    connectDB();
    console.log("Server is running @ port", PORT);
});
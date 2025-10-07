import express from "express";
import { connectDB } from "./db/connectDB.js"
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js";

config();
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, ()=> {
    connectDB();
    console.log("Server is running @ port", PORT);
});
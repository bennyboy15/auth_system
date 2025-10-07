import mongoose from "mongoose";

export async function connectDB() {

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected:", conn.connection.host);
    } catch (error) {
        console.log("Error connection to MongoDB:", error);
        process.exit(1); // 1=fail, 0=success
    }

}
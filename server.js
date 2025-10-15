import express from "express";
import { configDotenv } from "dotenv";
import connectDB from "./config/database.js";
import authrouter from "./routes/auth.route.js";
import deliveryrouter from "./routes/delivery.route.js";
import trackingrouter from "./routes/track.route.js";
import otpRouter from "./routes/otp.route.js";
configDotenv();
const port = process.env.PORT;
const app = express();

connectDB()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v2/auth",authrouter);
app.use("/api/v2/delivery",deliveryrouter);
app.use("/api/v2/tracking",trackingrouter);
app.use("/api/v2/otp",otpRouter);



if (!port){
    console.log("port is not defined");
    process.exit(1);
}
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
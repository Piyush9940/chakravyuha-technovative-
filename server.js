import express from "express";
import { configDotenv } from "dotenv";
import connectDB from "./config/database.js";
import authrouter from "./routes/auth.route.js";
configDotenv();
const port = process.env.PORT;
const app = express();

connectDB()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v2/auth",authrouter);



if (!port){
    console.log("port is not defined");
    process.exit(1);
}
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
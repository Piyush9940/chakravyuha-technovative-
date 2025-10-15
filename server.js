import express from "express";
import { configDotenv } from "dotenv";
import connectDB from "./config/database.js";
configDotenv();
const port = process.env.PORT;
const app = express();
connectDB()
if (!port){
    console.log("port is not defined");
    process.exit(1);
}
app.listen(port,(req,res)=>{
    console.log(`server is running on port ${port}`);
})
import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{

    try {

        const connectionURL = `${process.env.MONGODB_URL}/${DB_NAME}`
        const connectionInstance = await mongoose.connect(connectionURL)

        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);

    } catch (error) {

        console.error("MONGODB connection error : ", error);
        throw error 
    }
    
}

export default connectDB
import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionURL = `${process.env.MONGODB_URL}/${DB_NAME}`

        // console.log(connectionURL);
        // console.log(typeof connectionURL);
        const connectionInstance = await mongoose.connect(connectionURL)
        console.log(connectionInstance);
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection error : ", error);
        // process.exit()
        throw error 
    }
}

export default connectDB
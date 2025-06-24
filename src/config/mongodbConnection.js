// import mongoose from "mongoose";

// const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// // Connect to the default database using MONGODB_URI
// const connectToMongoDB = async () => {
//     try {
//         const uri = process.env.MONGODB_URI;
//         if (!uri) {
//             throw new Error("MONGODB_URI is not defined in environment variables.");
//         }
//         await mongoose.connect(uri, clientOptions);
//         await mongoose.connection.db.admin().command({ ping: 1 });
//         console.log("Connected to MongoDB successfully");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         process.exit(1);
//     }
// };

// // Get a connection to a different database on the same cluster
// export const getDbConnection = (dbName) => {
//     return mongoose.connection.useDb(dbName, { useCache: true });
// };

// export default connectToMongoDB;


import mongoose from "mongoose";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// Connect to the master database
const connectToMongoDB = async () => {
    try {
        // Use MONGODB_URI and MONGODB_DB from environment variables
        let uri = process.env.MONGODB_URI;
        const dbName = process.env.MONGODB_DB || "masterdb";
        // Ensure URI ends with / and append dbName
        if (!uri.endsWith("/")) uri += "/";
        uri = uri + dbName;
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log(`Connected to MongoDB master database: ${dbName}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

// Get a connection to a different database on the same cluster
export const getDbConnection = (dbName) => {
    return mongoose.connection.useDb(dbName, { useCache: true });
};

export default connectToMongoDB;

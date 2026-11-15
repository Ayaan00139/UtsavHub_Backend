var mongoose = require("mongoose");

function doMongooseConnection() {
  let url = process.env.ATLAS_URL || process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!url) {
    console.error("FATAL: MongoDB connection string (ATLAS_URL / MONGO_URI) is not defined in environment variables!");
    return;
  }
  console.log("Connecting to MongoDB at:", url.replace(/:([^:@]{1,})@/, ':****@'));

  mongoose
    .connect(url, { dbName: "mern", serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("Connected to MongoDB (mern database) successfully"))
    .catch((err) => console.log("MongoDB connection error:", err.message));
}

module.exports = { doMongooseConnection };

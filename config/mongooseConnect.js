var mongoose = require("mongoose");

function doMongooseConnection() {
  let url = process.env.ATLAS_URL ;
  console.log("Connecting to MongoDB at:", url);

  mongoose
    .connect(url, { dbName: "mern" })
    .then(() => console.log("Connected to MongoDB Compass (mern database) successfully"))
    .catch((err) => console.log("MongoDB connection error:", err.message));
}

module.exports = { doMongooseConnection };

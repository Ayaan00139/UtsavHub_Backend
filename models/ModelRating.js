var mongoose = require("mongoose");

/**
 * Rating Mongoose Schema & Model
 * Collection: ratings
 * - vendorMail: unique email of the vendor
 * - stars: accumulated stars (default 0)
 * - count: total number of users who rated (default 0)
 */
let colDesign = {
  vendorMail: { type: String, required: true, index: true, unique: true },
  stars: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  ratedUsers: { type: Array, default: [] }, // Array of user emails who have rated
  dos: { type: Date, default: Date.now },
};

var ver = {
  versionKey: false,
};

let collectionObj = new mongoose.Schema(colDesign, ver);

// Model linked with 'ratings' collection in MongoDB Compass / Atlas
let RatingColRef = mongoose.model("rating", collectionObj, "ratings");

module.exports = RatingColRef;

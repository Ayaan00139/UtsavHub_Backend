var mongoose = require("mongoose");

/**
 * Favs Mongoose Schema & Model
 * Matches diagram:
 * Collection: favs
 * citizenemail (ce): user/citizen email
 * vendoremails (vem): comma-separated vendor emails (e.g. "a@gmail.com,b@gmail.com")
 */
let colDesign = {
  citizenemail: { type: String, required: true, index: true, unique: true },
  vendoremails: { type: String, default: "" },
  dos: { type: Date, default: Date.now },
};

var ver = {
  versionKey: false,
};

let collectionObj = new mongoose.Schema(colDesign, ver);

// Model linked with 'favs' collection in MongoDB Compass / Atlas
let FavColRef = mongoose.model("fav", collectionObj, "favs");

module.exports = FavColRef;

var mongoose = require("mongoose");

/**
 * User / Signup Mongoose Schema & Model
 * Matches wireframe fields:
 * [emailid, password, utype, status, dos]
 */
let colDesign = {
  emailid: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true },
  utype: { type: String, default: "Customer" },
  status: { type: String, default: "Active" },
  dos: { type: Date, default: Date.now },
};

var ver = {
  versionKey: false, // avoids __v field in MongoDB
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);

// Model linked with 'users' collection in MongoDB Compass / Atlas
let SignupColRef = mongoose.model("user", collectionObj, "users");

module.exports = SignupColRef;

var mongoose = require("mongoose");

/**
 * Citizen Mongoose Schema & Model
 * Matches wireframe fields:
 * [emailid, acardno, name, dob, gender, address, city, contact]
 */
let colDesign = {
  citizenMail: { type: String, required: true, index: true, unique: true },
  citizenAcardno: { type: String, required: true },
  citizenName: { type: String, default: "" },
  citizenDob: { type: String, default: "" },
  citizenGender: { type: String, default: "Male" },
  citizenAddress: { type: String, default: "" },
  citizenCity: { type: String, default: "" },
  citizenContact: { type: String, default: "" },
  dos: { type: Date, default: Date.now },
};

var ver = {
  versionKey: false, // avoids __v field in MongoDB
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);

// Model linked with 'citizens' collection in MongoDB Compass / Atlas
let CitizenColRef = mongoose.model("citizen", collectionObj, "citizens");

module.exports = CitizenColRef;

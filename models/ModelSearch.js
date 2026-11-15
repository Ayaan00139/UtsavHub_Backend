var mongoose = require("mongoose");

/**
 * Citizen Mongoose Schema & Model
 * Matches wireframe fields:
 * [emailid, acardno, name, dob, gender, address, city, contact]
 */
let colDesign = {
  event: { type: String, required: true, index: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String, default: "" },
  services: { type: Array, default: [] },
};

var ver = {
  versionKey: false, // avoids __v field in MongoDB
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);

// Model linked with 'citizens' collection in MongoDB Compass / Atlas
let EventColRef = mongoose.model("event", collectionObj, "events");

module.exports = EventColRef;

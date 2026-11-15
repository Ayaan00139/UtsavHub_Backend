var mongoose = require("mongoose");

let colDesign = {
  vendorMail: { type: String, required: true, index: true, unique: true },
  vendorName: { type: String, default: "" },
  vendorContact: { type: String, default: "" },
  vendorBusiness: { type: String, default: "" },
  vendorArea: { type: String, default: "" },
  vendorAddress: { type: String, default: "" },
  vendorCity: { type: String, default: "" },
  vendorEstd: { type: String, default: "" },
  vendorCategory: { type: Array, default: [] },
  vendorWebsite: { type: String, default: "" },
  vendorInsta: { type: String, default: "" },
  vendorPic1: { type: String, default: "" },
  vendorPic2: { type: String, default: "" },
  dos: { type: Date, default: Date.now },
};

var ver = {
  versionKey: false, // avoids __v field in MongoDB table
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);

// Model linked with vendor collection in MongoDB
let VendorColRef = mongoose.model("vendor", collectionObj, "vendor");

module.exports = VendorColRef;

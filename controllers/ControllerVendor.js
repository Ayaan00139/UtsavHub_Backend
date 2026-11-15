var VendorColRef = require("../models/ModelVendor");
var { getCloudinaryObject } = require("../config/configCloud");
var path = require("path");
const fs = require("fs");

let cloudinary = getCloudinaryObject();

/**
 * 1. Find vendor by emailid
 * Used when user clicks "Fetch" in frontend
 */
async function doFind(req, resp) {
  const vendorMail = req.user.email;
  console.log(`[Vendor/Find] Fetching vendor profile for: ${vendorMail}`);

  VendorColRef.findOne({ "vendorMail": vendorMail })
    .then((result) => {
      if (result != null) {
        console.log(`[Vendor/Find] Found vendor record for: ${vendorMail}`);
        resp.json({ status: true, msg: result, record: result });
      }
      else {
        console.log(`[Vendor/Find] No vendor record found for: ${vendorMail}`);
        resp.json({ status: false, msg: "Record Not Found", record: null });
      }
    })
    .catch((err) => {
      console.error(`[Vendor/Find] Database error for ${vendorMail}:`, err);
    }
  )}
/**
 * 2. Register / Save new vendor
 * Used when user clicks "Save" in frontend
 */
async function doSignup(req, resp) {
  let myUrl1;
  let myUrl2;
  const vendorMail = req.user.email;
  req.body.vendorMail = vendorMail;
  console.log(`[Vendor/Signup] Vendor profile registration submitted for: ${vendorMail}`);

  const duplicate = await VendorColRef.findOne({ vendorMail });
  if (duplicate) {
    console.log(`[Vendor/Signup] Rejected: Email already registered as vendor: ${vendorMail}`);
    return resp.json({ status: false, msg: "Email already registered" });
  }

  if (req.files?.vendorPic1 != null) {
    let file1 = req.files.vendorPic1.name;
    let fullPath1 = path.join(__dirname, "..", "uploads", file1);
    await req.files.vendorPic1.mv(fullPath1);
    try {
      const picUrlResult1 = await cloudinary.uploader.upload(fullPath1);
      myUrl1 = picUrlResult1.url;
    } finally {
      try {
        await fs.promises.unlink(fullPath1);
      } catch (e) {}
    }
  }

  if (req.files?.vendorPic2 != null) {
    let file2 = req.files.vendorPic2.name;
    let fullPath2 = path.join(__dirname, "..", "uploads", file2);
    await req.files.vendorPic2.mv(fullPath2);
    try {
      const picUrlResult2 = await cloudinary.uploader.upload(fullPath2);
      myUrl2 = picUrlResult2.url;
    } finally {
      try {
        await fs.promises.unlink(fullPath2);
      } catch (e) {}
    }
  }

  let vendorName = req.body.vendorName
  let vendorContact = req.body.vendorContact
  let vendorBusiness = req.body.vendorBusiness
  let vendorArea = req.body.vendorArea
  let vendorAddress = req.body.vendorAddress
  let vendorCity = req.body.vendorCity
  let vendorEstd = req.body.vendorEstd
  let vendorCategory = req.body.vendorCategory
  if (typeof req.body.vendorCategory === 'string') {
    try {
      req.body.vendorCategory = JSON.parse(req.body.vendorCategory);
    } catch (e) { }
  }
  let vendorWebsite = req.body.vendorWebsite
  let vendorInsta = req.body.vendorInsta

  req.body.vendorPic1 = myUrl1;
  req.body.vendorPic2 = myUrl2;

  let doc = new VendorColRef(req.body);
  doc.save().then((res) => {
    console.log(`[Vendor/Signup] Vendor profile saved to MongoDB for: ${vendorMail}`);
    resp.json({ status: true, "msg": "Record Saved Successfullyyy" });
  }).catch((err) => {
    console.error(`[Vendor/Signup] Database save error for ${vendorMail}:`, err);
    resp.json({ status: false, "msg": err });
  });

}

/**
 * 3. Update existing vendor profile
 * Used when user clicks "Update" in frontend
 */
async function doUpdate(req, resp) {
  console.log(`[Vendor/Update] Updating vendor profile for: ${req.user.email}`);

  let myUrl1 = "nopic.jpg";
  let myUrl2 = "nopic.jpg"

  if (req.files?.vendorPic1 != null) {
    let fileName1 = req.files.vendorPic1.name;
    let fullPath1 = path.join(__dirname, "..", "uploads", fileName1);

    await req.files.vendorPic1.mv(fullPath1);
    console.log(`[Vendor/Update] Vendor Pic 1 saved locally -> uploading to Cloudinary...`);

    try {
      const picUrlResult1 = await cloudinary.uploader.upload(fullPath1);
      myUrl1 = picUrlResult1.url;
      console.log(`[Vendor/Update] Vendor Pic 1 hosted on Cloudinary: ${myUrl1}`);
    } finally {
      try {
        await fs.promises.unlink(fullPath1);
        console.log(`[Vendor/Update] Cleaned up local file for Pic 1`);
      } catch (e) {}
    }
  }

  if (req.files?.vendorPic2 != null) {
    let fileName2 = req.files.vendorPic2.name;
    let fullPath2 = path.join(__dirname, "..", "uploads", fileName2);

    await req.files.vendorPic2.mv(fullPath2);
    console.log(`[Vendor/Update] Vendor Pic 2 saved locally -> uploading to Cloudinary...`);

    try {
      const picUrlResult2 = await cloudinary.uploader.upload(fullPath2);
      myUrl2 = picUrlResult2.url;
      console.log(`[Vendor/Update] Vendor Pic 2 hosted on Cloudinary: ${myUrl2}`);
    } finally {
      try {
        await fs.promises.unlink(fullPath2);
        console.log(`[Vendor/Update] Cleaned up local file for Pic 2`);
      } catch (e) {}
    }
  }

  let vendorName = req.body.vendorName
  let vendorContact = req.body.vendorContact
  let vendorBusiness = req.body.vendorBusiness
  let vendorArea = req.body.vendorArea
  let vendorAddress = req.body.vendorAddress
  let vendorCity = req.body.vendorCity
  let vendorEstd = req.body.vendorEstd
  let vendorCategory = req.body.vendorCategory
  if (typeof req.body.vendorCategory === 'string') {
    try {
      req.body.vendorCategory = JSON.parse(req.body.vendorCategory);
    } catch (e) { }
  }
  let vendorWebsite = req.body.vendorWebsite
  let vendorInsta = req.body.vendorInsta

  if (myUrl1 != "nopic.jpg") {
    req.body.vendorPic1 = myUrl1
  }

   if (myUrl2 != "nopic.jpg") {
    req.body.vendorPic2 = myUrl2
  }

  req.body.vendorMail = req.user.email;
  VendorColRef.updateOne({ vendorMail: req.user.email }, { $set: req.body })
    .then((result) => {
      console.log(`[Vendor/Update] Successfully updated vendor profile in DB for: ${req.user.email}`);
      resp.json({ status: true, msg: "Record Updated Successfullyyy" });
    })
    .catch((err) => {
      console.error(`[Vendor/Update] Update error for ${req.user.email}:`, err);
      resp.json({ status: false, msg: err });
    });

}

module.exports = { doFind, doSignup, doUpdate };

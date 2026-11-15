var CitizenColRef = require("../models/ModelCitizen");
var { CallAi } = require("../config/gemini");
var { getCloudinaryObject } = require("../config/configCloud");
var path = require("path");
const fs = require("fs");
const crypto = require("crypto");
let cloudinary = getCloudinaryObject();

/**
 * 1. AI Aadhaar OCR Extraction Endpoint
 * Accepts frontCard and/or backCard uploaded via express-fileupload or base64.
 * Uses Gemini 3.8 Flash Lite / Flash to extract structured identity data.
 */
async function doExtractAadhaar(req, resp) {
  try {
    let myUrl1="nopic.jpg"
    let myUrl2="nopic.jpg"

    // Check express-fileupload files
    if (req.files) {
      if (req.files.frontCard) {
        let fileName1 = `${Date.now()}_front_${req.files.frontCard.name.replace(/\s+/g, '_')}`;
        let fullPath1 = path.join(__dirname, "..", "uploads", fileName1);

        await req.files.frontCard.mv(fullPath1);
        console.log(`[Customer/OCR] Front card saved locally -> uploading to Cloudinary...`);

        try {
          const picUrlResult1 = await cloudinary.uploader.upload(fullPath1);
          myUrl1 = picUrlResult1.url;
          console.log(`[Customer/OCR] Front card hosted on Cloudinary: ${myUrl1}`);
        } finally {
          try {
            await fs.promises.unlink(fullPath1);
            console.log(`[Customer/OCR] Cleaned up local front card file`);
          } catch (e) {}
        }
      }

      if (req.files.backCard) {
        let fileName2 = `${Date.now()}_back_${req.files.backCard.name.replace(/\s+/g, '_')}`;
        let fullPath2 = path.join(__dirname, "..", "uploads", fileName2);

        await req.files.backCard.mv(fullPath2);
        console.log(`[Customer/OCR] Back card saved locally -> uploading to Cloudinary...`);

        try {
          const picUrlResult2 = await cloudinary.uploader.upload(fullPath2);
          myUrl2 = picUrlResult2.url;
          console.log(`[Customer/OCR] Back card hosted on Cloudinary: ${myUrl2}`);
        } finally {
          try {
            await fs.promises.unlink(fullPath2);
            console.log(`[Customer/OCR] Cleaned up local back card file`);
          } catch (e) {}
        }
      }
    }
  
    let imageParts = [myUrl1, myUrl2];

    console.log(`[Customer/OCR] Sending image(s) to Gemini AI OCR model...`);
    const extractedData = await CallAi(imageParts);
    console.log(`[Customer/OCR] Gemini AI successfully extracted Aadhaar details`);
    return resp.json({
      success: true,
      data: extractedData
    });
} catch (err) {
  console.error("[CustomerController] OCR Extraction Error:", err);
  return resp.status(500).json({
    success: false,
    message: err.message || "Failed to process Aadhaar card OCR"
  });
}
}

/**
 * 2. Customer Registration / Signup
 * Saves new citizen details to MongoDB: [citizenMail, citizenAcardno, citizenName, citizenDob, citizenGender, citizenAddress, citizenCity, citizenContact]
 */
async function doSignup(req, resp) {
  try {
    const citizenMail = req.user.email;
    req.body.citizenMail = citizenMail;
    console.log(`[Customer/Signup] Received profile registration for customer: ${citizenMail}`);

    let citizenAcardno = req.body.citizenAcardno;
    if (citizenAcardno) {
      citizenAcardno = crypto.createHash("sha256").update(String(citizenAcardno).trim()).digest("hex");
    }
    const citizenName = req.body.citizenName;
    const citizenDob = req.body.citizenDob;
    const citizenGender = req.body.citizenGender;
    const citizenAddress = req.body.citizenAddress || "";
    const citizenCity = req.body.citizenCity || "";
    const citizenContact = req.body.citizenContact || "";

    if (!citizenMail) {
      return resp.json({
        status: false,
        msg: "Citizen Email ID is required"
      });
    }
    const existing = await CitizenColRef.findOne({
      $or: [
        { citizenMail: citizenMail.trim() },
      ]
    });

    if (existing) {
      console.log(`[Customer/Signup] Rejected: ${citizenMail} already has a customer profile`);
      return resp.json({
        status: false,
        msg: "This Email ID is already registered as a customer."
      });
    }

    const newCitizen = new CitizenColRef({
      citizenMail: citizenMail.trim(),
      citizenAcardno,
      citizenName,
      citizenDob,
      citizenGender,
      citizenAddress,
      citizenCity,
      citizenContact
    });

    const saved = await newCitizen.save();
    console.log(`[Customer/Signup] Customer profile successfully saved to MongoDB for: ${saved.citizenMail}`);
    return resp.json({
      status: true,
      msg: "Record Saved Successfully",
      record: saved
    });
  } catch (err) {
    console.error("[CustomerController] Signup Error:", err);
    return resp.json({
      status: false,
      msg: err.message || "Internal server error"
    });
  }
}

/**
 * 3. Find / Fetch Customer by Email
 * Used when user clicks "Fetch" in the UI
 */
async function doFind(req, resp) {
  try {
    const citizenMail = req.user.email

    if (!citizenMail || !citizenMail.trim()) {
      return resp.status(400).json({
        status: false,
        success: false,
        message: "Please provide an email to search."
      });
    }

    const searchMail = citizenMail.trim();
    console.log(`[Customer/Find] Querying customer profile for: ${searchMail}`);

    const citizen = await CitizenColRef.findOne({
      $or: [
        { citizenMail: searchMail },
        { citizenMail: new RegExp(`^${searchMail}$`, 'i') }
      ]
    });

    if (citizen) {
      console.log(`[Customer/Find] Found customer profile for: ${searchMail}`);
      return resp.json({
        status: true,
        success: true,
        citizen: citizen,
        record: citizen
      });
    } else {
      console.log(`[Customer/Find] No customer profile found for: ${searchMail}`);
      return resp.status(404).json({
        status: false,
        success: false,
        message: "No customer found with this email ID."
      });
    }
  } catch (err) {
    console.error("[CustomerController] Find Error:", err);
    return resp.status(500).json({
      status: false,
      success: false,
      message: err.message
    });
  }
}

/**
 * 4. Modify / Update Customer Record
 * Updates citizen fields in MongoDB by citizenMail
 */
async function doUpdate(req, resp) {
  try {
    const citizenMail = req.user.email;
    console.log(`[Customer/Update] Updating profile for: ${citizenMail}`);

    let citizenAcardno = req.body?.citizenAcardno;
    if (citizenAcardno) {
      citizenAcardno = crypto.createHash("sha256").update(String(citizenAcardno).trim()).digest("hex");
    }
    const citizenName = req.body?.citizenName;
    const citizenDob = req.body?.citizenDob;
    const citizenGender = req.body?.citizenGender;
    const citizenAddress = req.body?.citizenAddress;
    const citizenCity = req.body?.citizenCity;
    const citizenContact = req.body?.citizenContact;

    if (!citizenMail) {
      return resp.status(400).json({
        status: false,
        success: false,
        message: "Customer Email ID is required to update customer record."
      });
    }

    const updated = await CitizenColRef.findOneAndUpdate(
      {
        citizenMail
      },
      {
        citizenMail,
        citizenAcardno,
        citizenName,
        citizenDob,
        citizenGender,
        citizenAddress,
        citizenCity,
        citizenContact
      },
      { new: true }
    );

    if (!updated) {
      return resp.status(404).json({
        status: false,
        success: false,
        message: "Customer record not found to update."
      });
    }
    console.log("[Customer/Update] Successfully updated customer profile for:", updated.citizenMail);
    return resp.json({
      status: true,
      success: true,
      message: "Customer details updated successfully!",
      citizen: updated,
      customer: updated,
      record: updated
    });
  } catch (err) {
    console.error("[CustomerController] Update Error:", err);
    return resp.status(500).json({
      status: false,
      success: false,
      message: err.message
    });
  }
}

module.exports = {
  doExtractAadhaar,
  doSignup,
  doFind,
  doUpdate
};

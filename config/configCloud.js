var cloudinary = require("cloudinary").v2;
require("dotenv").config();

function getCloudinaryObject() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUD_APII,
    api_secret: process.env.CLOUD_SECRET,
    
  });
  console.log("Connected");
  return cloudinary;
}

module.exports = { getCloudinaryObject };

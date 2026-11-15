var express = require("express");
const {
  doExtractAadhaar,
  doSignup,
  doFind,
  doUpdate
} = require("../controllers/ControllerCustomer");
const tokenValidate = require("../MiddleWare/tokenValidate");
const limiter = require("../MiddleWare/rateLimiter")

let router = express.Router();

// Protected Customer Routes (requires valid JWT access token)
// 1. AI Aadhaar OCR extraction with Gemini 3.8 Flash Lite (Protected)
router.post("/extract-aadhaar", limiter(5,15), tokenValidate, doExtractAadhaar);

// 2. Customer Profile Registration (Protected)
router.post("/signup", limiter(10,15), tokenValidate, doSignup);

// 3. Find / Fetch Customer Profile by Email
router.post("/find",limiter(10,15) , tokenValidate, doFind);

// 4. Modify / Update Customer Profile
router.post("/update",limiter(10,15) , tokenValidate, doUpdate);

module.exports = router;

var express = require("express");
const {
  doSignup,
  doFind,
  doUpdate,
} = require("../controllers/ControllerVendor");
const tokenValidate = require("../MiddleWare/tokenValidate");
const limiter = require("../MiddleWare/rateLimiter")
let router = express.Router();


router.post("/signup", limiter(10,15), tokenValidate, doSignup);
router.post("/find",tokenValidate, doFind);
router.post("/update",limiter(10,15), tokenValidate,doUpdate);

module.exports = router;

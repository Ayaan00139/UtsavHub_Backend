const express = require("express");
const {
  doSearchVendors,
  doGetAllVendors,
  doGetEvents,
  doGetCities
} = require("../controllers/ControllerSearch");
const tokenValidate = require("../MiddleWare/tokenValidate");

const router = express.Router();

/**
 * Dedicated Search Router (Protected - requires valid JWT access token)
 * Only authenticated/logged-in users can search or view vendors, events, and cities.
 */
router.use(tokenValidate);

router.post("/vendors", doSearchVendors);
router.get("/all", doGetAllVendors);
router.get("/events", doGetEvents);
router.get("/cities", doGetCities);

module.exports = router;

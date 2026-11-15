const express = require("express");
const {
  doAddRating,
  doGetAllRatings,
} = require("../controllers/ControllerRating");
const tokenValidate = require("../MiddleWare/tokenValidate");
const limiter = require("../MiddleWare/rateLimiter")
const router = express.Router();

/**
 * Rating Routes (Protected - requires valid JWT access token)
 * POST /rating/rate -> Add or increment rating for a vendor
 * GET  /rating/all  -> Get all ratings
 */
router.use(tokenValidate);

router.post("/rate",limiter(10,15), doAddRating);
router.get("/all", doGetAllRatings);

module.exports = router;

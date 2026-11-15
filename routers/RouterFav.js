const express = require("express");
const {
  doAddToFav,
  doGetFavs,
  doRemoveFromFav
} = require("../controllers/ControllerFav");
const tokenValidate = require("../MiddleWare/tokenValidate");

const router = express.Router();

/**
 * Favs / Wishlist Routes (Protected - requires valid JWT access token)
 * POST /fav/add     -> Add vendor to wishlist
 * POST /fav/get     -> Get wishlisted vendors by citizenemail
 * POST /fav/remove  -> Remove vendor from wishlist
 */
router.post("/add", tokenValidate, doAddToFav);
router.post("/get", tokenValidate, doGetFavs);
router.post("/remove", tokenValidate, doRemoveFromFav);

module.exports = router;

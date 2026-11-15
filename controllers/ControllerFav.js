const FavColRef = require("../models/ModelFav");
const VendorColRef = require("../models/ModelVendor");
const RatingColRef = require("../models/ModelRating");

/**
 * Controller: Wishlist / Favorites (FAVS)
 * 1. Add vendor to favs: stores citizenemail and comma-separated vendoremails
 * 2. Get favs: retrieves all wishlisted vendors for a citizen
 * 3. Remove from favs: removes a vendor email from vendoremails
 */

// 1. Add vendor to Favorites
async function doAddToFav(req, resp) {
  try {
    const citizenemail = req.user.email
    const vendoremail = (req.body.vendoremail)
    console.log(`[Fav/Add] Adding vendor "${vendoremail}" to favorites for: ${citizenemail}`);

    if (!citizenemail || !vendoremail) {
      return resp.json({
        status: false,
        msg: "Both citizen email and vendor email are required",
      });
    }

    let favDoc = await FavColRef.findOne({ citizenemail });

    if (!favDoc) {
      // Create new favs document
      favDoc = await FavColRef.create({
        citizenemail,
        vendoremails: vendoremail,
      });
    } else {
      const emailList = favDoc.vendoremails
        ? favDoc.vendoremails.split(",").map((e) => e.trim()).filter(Boolean)
        : [];
      if (!emailList.includes(vendoremail)) {
        emailList.push(vendoremail);
        favDoc.vendoremails = emailList.join(",");
        await favDoc.save();
      }
    }

    console.log(`[Fav/Add] Successfully added "${vendoremail}" to favorites for: ${citizenemail}`);
    return resp.json({
      status: true,
      msg: "Added to favorites successfully",
      favs: favDoc,
    });
  } catch (err) {
    console.error("[Fav/Add] Error:", err);
    return resp.status(500).json({ status: false, msg: err.message });
  }
}

// 2. Fetch Wishlisted Vendors for a citizen
async function doGetFavs(req, resp) {
  try {
    const citizenemail = (
      req.user.email
    )
    console.log(`[Fav/Get] Fetching wishlisted vendors for: ${citizenemail}`);

    if (!citizenemail) {
      return resp.json({
        status: false,
        msg: "Citizen email is required to fetch favorites",
      });
    }

    const favDoc = await FavColRef.findOne({ citizenemail });

    if (!favDoc || !favDoc.vendoremails) {
      console.log(`[Fav/Get] No favorites found for: ${citizenemail}`);
      return resp.json({
        status: true,
        msg: "No favorites found",
        vendoremails: "",
        vendors: [],
      });
    }

    // Split comma-separated string into array and find matching vendors
    const emails = favDoc.vendoremails.split(",");
    const vendors = await VendorColRef.find({ vendorMail: emails });

    // Attach rating details (stars, count, avgRating)
    const ratings = await RatingColRef.find({ vendorMail: { $in: emails } }).lean();
    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r.vendorMail] = r;
    });

    const enrichedVendors = vendors.map((vendor) => {
      const v = vendor.toObject ? vendor.toObject() : { ...vendor };
      const r = ratingMap[v.vendorMail];
      const stars = r ? r.stars : 0;
      const count = r ? r.count : 0;
      const avgRating = count > 0 ? Number((stars / count).toFixed(1)) : 0;
      const hasRated = Boolean(r && r.ratedUsers && r.ratedUsers.includes(citizenemail));
      return {
        ...v,
        stars,
        count,
        avgRating,
        rating: avgRating,
        hasRated,
      };
    });

    console.log(`[Fav/Get] Retrieved ${enrichedVendors.length} favorite vendor(s) for: ${citizenemail}`);
    return resp.json({
      status: true,
      vendoremails: favDoc.vendoremails,
      vendors: enrichedVendors,
    });
  } catch (err) {
    console.error("[Fav/Get] Error:", err);
    return resp.status(500).json({ status: false, msg: err.message });
  }
}

// 3. Remove a vendor from Favorites
async function doRemoveFromFav(req, resp) {
  try {
    const citizenemail = req.user.email
    const vendoremail = (req.body.vendoremail)
    console.log(`[Fav/Remove] Removing vendor "${vendoremail}" from favorites of: ${citizenemail}`);

    if (!citizenemail || !vendoremail) {
      return resp.json({
        status: false,
        msg: "Both citizen email and vendor email are required",
      });
    }

    let favDoc = await FavColRef.findOne({ citizenemail });
    if (!favDoc) {
      console.log(`[Fav/Remove] No favorites record found for: ${citizenemail}`);
      return resp.json({
        status: false,
        msg: "No favorites record found for this user",
      });
    }

    let emails = favDoc.vendoremails
      ? favDoc.vendoremails.split(",").map((e) => e.trim()).filter((e) => e && e !== vendoremail)
      : [];

    favDoc.vendoremails = emails.join(",");
    await favDoc.save();

    console.log(`[Fav/Remove] Successfully removed "${vendoremail}" for user: ${citizenemail}`);
    return resp.json({
      status: true,
      msg: "Removed from favorites successfully",
      vendoremails: favDoc.vendoremails,
    });
  } catch (err) {
    console.error("[Fav/Remove] Error:", err);
    return resp.status(500).json({ status: false, msg: err.message });
  }
}

module.exports = {
  doAddToFav,
  doGetFavs,
  doRemoveFromFav
};

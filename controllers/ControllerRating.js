const RatingColRef = require("../models/ModelRating");

/**
 * Controller: Vendor Star Ratings
 * 1. Add / increment rating for a vendor
 * 2. Get all ratings
 */

// 1. Add or Increment Vendor Rating
async function doAddRating(req, resp) {
  try {
    const vendorMail = req.body.vendorMail
    const userEmail = req.user.email
    const stars = Number(req.body.stars);
    console.log(`[Rating/Add] User ${userEmail} submitting ${stars}-star rating for vendor: ${vendorMail}`);

    if (!vendorMail) {
      return resp.json({
        status: false,
        msg: "Vendor email is required",
      });
    }
    if (!userEmail) {
      return resp.json({
        status: false,
        msg: "User email is required to submit a rating",
      });
    }
    if (String(vendorMail).trim().toLowerCase() === String(userEmail).trim().toLowerCase()) {
      console.log(`[Rating/Add] Rejected: Vendor tried to rate their own profile (${userEmail})`);
      return resp.json({
        status: false,
        msg: "Vendors cannot rate their own profile.",
      });
    }
    if (!stars || stars < 1 || stars > 5) {
      return resp.json({
        status: false,
        msg: "Please provide a valid rating between 1 and 5 stars",
      });
    }
    let ratingDoc = await RatingColRef.findOne({ vendorMail });

    if (!ratingDoc) {
      ratingDoc = await RatingColRef.create({
        vendorMail,
        stars: stars,
        count: 1,
        ratedUsers: [userEmail],
      });
    } else {
      if (ratingDoc.ratedUsers && ratingDoc.ratedUsers.includes(userEmail)) {
        console.log(`[Rating/Add] Rejected: User ${userEmail} already rated vendor ${vendorMail}`);
        return resp.json({
          status: false,
          msg: "You have already rated this vendor!",
        });
      }

      // Increment stars with existing amount, increment count, and add user
      ratingDoc.stars += stars;
      ratingDoc.count += 1;
      if (!ratingDoc.ratedUsers) {
        ratingDoc.ratedUsers = [];
      }
      ratingDoc.ratedUsers.push(userEmail);
      await ratingDoc.save();
    }
    const avgRating = Number((ratingDoc.stars / ratingDoc.count).toFixed(1));
    console.log(`[Rating/Add] Rating successfully recorded for ${vendorMail}: new average is ${avgRating} (${ratingDoc.count} review(s))`);
    return resp.json({
      status: true,
      msg: `Rating added! Total stars: ${ratingDoc.stars}, Ratings count: ${ratingDoc.count}, Average: ${avgRating}`,
      rating: {
        vendorMail: ratingDoc.vendorMail,
        stars: ratingDoc.stars,
        count: ratingDoc.count,
        avgRating,
      },
    });
  } catch (err) {
    console.error("[Rating/Add] Error in doAddRating:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message,
    });
  }
}

// 2. Fetch All Ratings
async function doGetAllRatings(req, resp) {
  try {
    console.log(`[Rating/All] Fetching all vendor ratings`);
    const ratings = await RatingColRef.find();
    console.log(`[Rating/All] Retrieved ${ratings.length} rating record(s)`);
    return resp.json({
      status: true,
      ratings,
    });
  } catch (err) {
    console.error("[Rating/All] Error in doGetAllRatings:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message,
    });
  }
}

module.exports = {
  doAddRating,
  doGetAllRatings,
};

const VendorColRef = require("../models/ModelVendor");
const EventColRef = require("../models/ModelSearch");
const RatingColRef = require("../models/ModelRating");

// Helper to attach ratings (stars, count, avgRating) to vendors
async function attachRatings(vendors) {
  try {
    const emails = vendors.map(v => v.vendorMail);
    const ratings = await RatingColRef.find({ vendorMail: { $in: emails } }).lean();
    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r.vendorMail] = r;
    });

    return vendors.map((vendor) => {
      const v = vendor.toObject ? vendor.toObject() : { ...vendor };
      const r = ratingMap[v.vendorMail];
      const stars = r ? r.stars : 0;
      const count = r ? r.count : 0;
      const avgRating = count > 0 ? Number((stars / count).toFixed(1)) : 0;
      return {
        ...v,
        stars,
        count,
        avgRating,
        rating: avgRating,
      };
    });
  } catch (e) {
    console.error("[attachRatings] Error:", e);
    return vendors;
  }
}

async function doSearchVendors(req, resp) {
  try {
    let city = (req.body.city);
    let service = (req.body.service);
    let query = {};

    if (city && String(city).trim() !== "") {
      query.vendorCity = String(city).trim();
    }

    if (service && String(service).trim() !== "") {
      query.vendorCategory = String(service).trim();
    }

    console.log(`[Search/Vendors] Executing search filter: city="${city || 'all'}", service="${service || 'all'}"`);

    const results = await VendorColRef.find(query);
    const enrichedResults = await attachRatings(results);
    console.log(`[Search/Vendors] Returned ${enrichedResults.length} vendor(s) matching search criteria`);
    
    return resp.json({
      status: true,
      msg: enrichedResults,
      count: enrichedResults.length
    });
  } catch (err) {
    console.error("[Search/Vendors] Search error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message
    });
  }
}
 
async function doGetAllVendors(req, resp) {
  try {
    console.log(`[Search/All] Fetching all registered vendors`);
    const results = await VendorColRef.find({});
    const enrichedResults = await attachRatings(results);
    console.log(`[Search/All] Retrieved ${enrichedResults.length} total vendor(s) from database`);

    return resp.json({
      status: true,
      msg: enrichedResults,
      count: enrichedResults.length
    });
  } catch (err) {
    console.error("[Search/All] GetAll error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message
    });
  }
}

async function doGetEvents(req,resp){
  try {
    console.log(`[Search/Events] Fetching event types`);
    const results = await EventColRef.find();
    console.log(`[Search/Events] Retrieved ${results.length} event type(s)`);

    return resp.json({
      status: true,
      msg: results,
      count: results.length
    });
  } catch (err) {
    console.error("[Search/Events] GetEvents error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message
    });
  }
}

async function doGetCities(req,resp){
  try {
    console.log(`[Search/Cities] Fetching distinct vendor cities`);
    const results = await VendorColRef.distinct("vendorCity");
    console.log(`[Search/Cities] Retrieved ${results.length} distinct city/cities: ${results.join(', ')}`);

    return resp.json({
      status: true,
      msg: results,
      count: results.length
    });
  } catch (err) {
    console.error("[Search/Cities] GetCities error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message
    });
  }
}

module.exports = {
  doSearchVendors,
  doGetAllVendors,
  doGetEvents,
  doGetCities
};

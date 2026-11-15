var mongoose = require("mongoose");

/**
 * Session Mongoose Schema & Model
 * Fields:
 * [user, refreshTokenHash, ip, userAgent, revoked, expiresAt]
 */
let colDesign = {
  user: { type: String, required: true, index: true },
  refreshTokenHash: { type: String, required: true, index: true },
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL: Mongo auto-deletes expired sessions
};

var ver = {
  versionKey: false, // avoids __v field in MongoDB
  timestamps: true,  // adds createdAt and updatedAt
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);

// Model linked with 'sessions' collection in MongoDB Compass / Atlas
let SessionColRef = mongoose.model("session", collectionObj, "sessions");

module.exports = SessionColRef;
var express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
var fileuploader = require("express-fileupload");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

var { doMongooseConnection } = require("./config/mongooseConnect.js");
var vendorRouter = require("./routers/RouterVendor.js");
var customerRouter = require("./routers/RouterCustomer.js");
var searchRouter = require("./routers/RouterSearch.js");
var favRouter = require("./routers/RouterFav.js");
var userRouter=require("./routers/RouterUser");
var ratingRouter = require("./routers/RouterRating.js");

let server = express();
server.set('trust proxy', 1);

// Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL
].filter(Boolean);

server.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like server-to-server or tools) or if in allowedOrigins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));
server.use(helmet());
server.use(cookieParser());
server.use(fileuploader({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  abortOnLimit: true
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Serve local upload files statically
server.use("/uploads", express.static("uploads"));

// Connect to MongoDB (MongoDB Compass / Atlas)
doMongooseConnection();


server.use("/vendor", vendorRouter);
server.use("/customer", customerRouter);
server.use("/search", searchRouter);
server.use("/fav", favRouter);
server.use("/user",userRouter);
server.use("/rating", ratingRouter);

// Serve Frontend static assets and handle SPA routes on port 2010
const fs = require("fs");
const frontendDistPath = path.join(__dirname, "../FrontEnd/dist");
if (fs.existsSync(frontendDistPath)) {
  server.use(express.static(frontendDistPath));
}

server.get(["/forgotpassword", "/forgetpassword", "/login", "/signup"], function (req, res) {
  const indexFile = path.join(__dirname, "../FrontEnd/dist/index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${clientUrl}${req.originalUrl}`);
});

let PORT = process.env.PORT || 2010;
server.listen(PORT, function () {
  console.log(`====================================================`);
  console.log(`🚀 UtsavHub Backend Server Running on Port ${PORT}`);
  console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔒 Security: Helmet & FileUpload limits active (5MB)`);
  console.log(`====================================================`);
});

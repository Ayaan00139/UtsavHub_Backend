const jwt = require("jsonwebtoken");

function tokenValidate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log(`[Auth] Blocked ${req.method} ${req.originalUrl} - Missing token`);
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
    if (err) {
      console.log(`[Auth] Blocked ${req.method} ${req.originalUrl} - Invalid or expired token`);
      return res.sendStatus(401);
    }

    req.user = user;
    console.log(`[Auth] Verified ${req.method} ${req.originalUrl} for user: ${user.email}`);
    next();
  });
}

module.exports = tokenValidate;
module.exports.tokenValidate = tokenValidate;

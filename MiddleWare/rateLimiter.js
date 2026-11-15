const { rateLimit } = require('express-rate-limit');

// A function that RETURNS a customized rate limiter
const createLimiter = (maxRequests = 50, minutes = 15) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      status: false,
      message: `Too many requests. Please try again after ${minutes} minutes.`,
      msg: `Too many requests. Please try again after ${minutes} minutes.`
    }
  });
};

module.exports = createLimiter;
module.exports.createLimiter = createLimiter;
module.exports.limiter = createLimiter;

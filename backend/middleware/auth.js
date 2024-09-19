const passport = require("passport");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const {
  ROLES,
  UNAUTHORIZED,
  LOGGED_IN,
  FORBIDDEN,
} = require("../utils/constants");
const APIError = require("../utils/APIError");

const RefreshToken = require("../api/models/refresh-token");
const {
  jwtExpirationInterval
} = require("../config/env-vars");

const getPayload = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return err
  }
};
const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  //   try {
  //      // Replace with your actual secret or public key
  //     req.user = payload; // Attach the payload to the req object
  //     next(); // Call the next middleware or route handler
  //   } catch (err) {
  //     return res.status(401).json({ message: 'Token is invalid or expired' });
  //   }
  // };
  const error = err || info;
  const apiError = new APIError({
    message: error ? error.message : "Unauthorized",
    status: UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  const payload = await getPayload(req);
  if (!payload || !payload.sub) return next(apiError);

  if (!roles.includes(payload.role)) return next(apiError);
  
  req.user = payload.sub
  return next();
};

exports.Authorize =
  (roles = ROLES) =>
  (req, res, next) =>
  passport.authenticate(
    "jwt", {
      session: false
    },
    handleJWT(req, res, next, roles)
  )(req, res, next);

exports.OptionalAuthorize = () => (req, res, next) => {
  const auth = req.header("Authorization");
  if (auth) {
    passport.authenticate(
      "jwt", {
        session: false
      },
      handleJWT(req, res, next, LOGGED_IN)
    )(req, res, next);
  } else {
    next();
  }
};

exports.generateTokenResponse = (admin, accessToken) => {
  const tokenType = "Bearer";
  const refreshToken = RefreshToken.generate(admin);
  const expiresIn = moment().add(jwtExpirationInterval, "minutes");
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
};
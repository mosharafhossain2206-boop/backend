const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { customError } = require("../helpers/customError");
const { asyhandler } = require("../utils/asyncHandler");

const authguard = async (req, res, next) => {
  const accesToken =
    req?.headers?.authorization?.replace("Bearer ", "") ||
    req?.body?.accesToken;
  const refreshToken = req?.headers?.cookie?.replace("refreshToken=", "");

  const decode = jwt.verify(accesToken, process.env.ACCESTOKEN_SECRECT);
  const user = await userModel
    .findById(decode.id)
    .populate("role")
    .populate("permission.permissionId")
    .select("name email image _id role permission refreshToken");
  if (!user) throw new customError(401, " unauthorized access !");
  req.user = user;
  next();
};

module.exports = { authguard };

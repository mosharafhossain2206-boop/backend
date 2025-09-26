const { customError } = require("../helpers/customError");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {
  registrationTemplate,
  resendTemplate,
  resetPasswordTemplate,
} = require("../template/registration");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateUser } = require("../validation/user.validation");
const crypto = require("crypto");
const { mailer } = require("../helpers/nodemailer");
const { apiResponse } = require("../utils/apiResponse");
const { sendSms } = require("../helpers/sendSms");
exports.registration = asyncHandler(async (req, res) => {
  const value = await validateUser(req);
  // now save the user data
  const userData = await new User({
    name: value.name,
    email: value.email || null,
    phone: value.phone || null,
    password: value.password,
  }).save();
  const otp = crypto.randomInt(1000, 9999);
  const expireTime = Date.now() + 10 * 60 * 1000;


  if (value.email) {
    const flink = `www.mern.com/verify/:${userData.email}`;
    // verification email
    const template = registrationTemplate(
      userData.name,
      otp,
      expireTime,
      flink
    );
    await mailer(template, userData.email);
    userData.resetPasswordOtp = otp;
    userData.resetPasswordExpires = expireTime;
  }

  if(value.phone) {
  const flink = `www.mern.com/verify/:${userData.phone}`;
  const smsBody = `Your OTP for registration is ${otp}. It will expire in ${expireTime} minutes. Complete your registration here: ${flink}`
  await sendSms(userData.phone ,smsBody)
  }

  await userData.save();
  apiResponse.sendSucess(res,201 , "Registration Succesfull"  ,userData)
});

// verify email
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, opt } = req.body;
  if (!email || !opt) {
    throw new customError(401, "email or otp Missing");
  }
  // find the user using email
  const findUser = await User.findOne({
    $and: [
      { $or: [{phone: req.body.phone} , {email: email }]},
      { resetPasswordOtp: opt },
      { resetPasswordExpires: { $gt: Date.now() } },
    ],
  });
  if (!findUser) {
    throw new customError(401, "user not found  or time expires!!");
  }
  findUser.isEmailVerified = true;
  findUser.resetPasswordOtp = null;
  findUser.resetPasswordExpires = null;
  await findUser.save();
  apiResponse.sendSucess(res, 200, "Email Verification Sucessfullly", findUser);
});

// resend otp
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, "email Missing");
  }

  const userData = await User.findOne({
    email: email,
  });

  if (!userData) {
    throw new customError(401, "user not found!!");
  }
  const otp = crypto.randomInt(1000, 9999);
  const expireTime = Date.now() + 10 * 60 * 1000;
  // const flink = `www.mern.com/verify-email/:${userData.email}`;
  const flink = `https://dummyjson.com/products`;
  // verification email
  const template = resendTemplate(userData.name, otp, expireTime, flink);
  await mailer(template, userData.email);
  userData.resetPasswordOtp = otp;
  userData.resetPasswordExpires = expireTime;
  await userData.save();
  apiResponse.sendSucess(
    res,
    200,
    "resend Opt send succsfull check your mail ",
    { name: userData.name }
  );
});

// forgot password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, "email Missing");
  }

  const userData = await User.findOne({
    email: email,
  });

  if (!userData) {
    throw new customError(401, "user not found!!");
  }

  // const flink = `www.mern.com/verify-email/:${userData.email}`;
  const flink = `https://dummyjson.com/products`;
  // verification email
  const template = resetPasswordTemplate(userData.name, flink);
  await mailer("Forgot Password", template, userData.email);

  apiResponse.sendSucess(res, 200, " check your mail ", {
    name: userData.name,
  });
});

// reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confrimPassword } = req.body;
  if (!email || !newPassword || !confrimPassword) {
    throw new customError(401, "email or password missing ");
  }

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  regex.test(newPassword);
  if (!regex.test(newPassword)) {
    throw new customError(
      401,
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit"
    );
  }

  if (newPassword !== confrimPassword) {
    throw new customError(401, "Password not Match !!");
  }

  const findUser = await User.findOne({ email });
  if (!findUser) {
    throw new customError(401, "User not Found!!");
  }
  // change
  findUser.password = newPassword;
  await findUser.save();
  apiResponse.sendSucess(res, 200, "Reset password Sucessfully", findUser);
});

// login
exports.login = asyncHandler(async (req, res) => {
  const { email, password, phone } = await validateUser(req);

  const findUser = await User.findOne({ email, phone });
  if (!findUser) {
    throw new customError(401, "User not Found !!");
  }

  // finuse

  const isMatchedPassword = await findUser.comparePassword(password);

  if (!isMatchedPassword) {
    throw new customError(401, "Password Not Matched !!");
  }

  // generate access token and refresh token
  const accesToken = await findUser.generateAccesToken();
  const refreshToken = await findUser.generateRefreshToken();
  // send refreshToken into cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents JS access (security)
    secure: process.env.NODE_ENV == "developement" ? false : true, // Sends cookie only over HTTPS
    sameSite: "none", // CSRF protection
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
  // set refreshToken inot db
  findUser.refreshToken = refreshToken;

  await findUser.save();
  apiResponse.sendSucess(res, 200, "login Sucessfull", {
    data: {
      name: findUser.name,
      acceesToken: accesToken,
    },
  });
});

//@desc logut
exports.logout = asyncHandler(async (req, res) => {
  const token = req?.headers?.authorization || req?.body?.accesToken;
  const decode = await jwt.verify(token, process.env.ACCESTOKEN_SECRECT);
  const client = await User.findById(decode.id);
  if (!client) throw new customError(401, "user not found !");
  //  clear the refresh Token
  client.refreshToken = null;
  await client.save();

  // now clear the cookie from browser
  res.clearCookie("refreshToken", {
    httpOnly: true, // Prevents JS access (security)
    secure: process.env.NODE_ENV == "developement" ? false : true, // Sends cookie only over HTTPS
    sameSite: "none", // CSRF protection
    path: "/",
  });
  // send sms
  const smsRes = await sendSms(
    "01761654478",
    "logout Sucesfully Mr " + client.name
  );
  if (smsRes.response_code !== 202) {
    throw new customError(500, "Send Sms Failed !!");
  }
  //  return res.status(301).redirect('www.frn.com/logout')
  apiResponse.sendSucess(res, 200, "logout Sucessfull", client);
});

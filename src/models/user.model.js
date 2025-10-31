require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { customError } = require("../helpers/customError");
const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: [true, "Email Must be unique"],
  },
  phone: {
    type: Number,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  image: {},
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "Bangladesh",
  },
  zipCode: {
    type: Number,
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    trim: true,
    enum: ["male", "female", "other"],
  },
  lastlogin: Date,
  lastLogout: Date,
  cart: [
    {
      type: Types.ObjectId,
      ref: "Product",
    },
  ],
  wishList: [
    {
      type: Types.ObjectId,
      ref: "Product",
    },
  ],
  newsLetterSubscribe: Boolean,
  role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  permission: [
    {
      permissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
      actions: [
        {
          type: String,
          trim: true,
          enum: ["add", "view", "edit", "delete"],
        },
      ],
    },
  ],

  resetPasswordOtp: Number,
  resetPasswordExpires: Date,
  twoFactorEnabled: Boolean,
  isBlocked: Boolean,
  isActive: Boolean,

  refreshToken: {
    type: String,
    trim: true,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// check user email or phone already exist or not
userSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    email: this.email,
  });

  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, "Email Already Exist");
  }
  next();
});

// compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate access Token
userSchema.methods.generateAccesToken = async function () {
  return await jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      phone: this.phone,
    },
    process.env.ACCESTOKEN_SECRECT,
    { expiresIn: process.env.ACCESTOKEN_EXPIRE }
  );
};

// generate access Token
userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESHTOKEN_SECRECT,
    { expiresIn: process.env.REFRESHTOKEN_EXPIRE }
  );
};

// verify access token
userSchema.methods.verifyAccesToken = async function (token) {
  return await jwt.verify(token, process.env.ACCESTOKEN_SECRECT);
};

// verify access token
userSchema.methods.verifyRefreshToken = async function (token) {
  return await jwt.verify(token, process.env.REFRESHTOKEN_SECRECT);
};
module.exports = mongoose.model("User", userSchema);

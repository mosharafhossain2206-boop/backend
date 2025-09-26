const { log } = require("console");
const { customError } = require("./customError");
const fs = require("fs");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRECT,
});

exports.uploadCloudinaryFile = async (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath))
      throw new customError(401, "image path missing");
    //
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      quality: "auto",
    });
    if (response) {
      fs.unlinkSync(filePath);
    }
    return { publicId: response.public_id, url: response.secure_url };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new customError(500, "Failed to upload image " + error.message);
  }
};

// delete 
exports.deleteClodinaryFile = async (publicId)=> {
  try {

    const response =  await cloudinary.uploader.destroy(publicId)
    return response;
    
  } catch (error) {
        throw new customError(500, "Failed to delete image " + error.message);
  }
}


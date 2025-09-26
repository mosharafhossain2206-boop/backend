const QRCode = require("qrcode");
const { customError } = require("./customError");

// generate QR code
exports.generateQrCode = async (text) => {
  try {
    if (!text)
      throw new customError(401, "text is required to generate QR code");
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/jpeg",
      quality: 0.3,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new customError(500, "Failed to generate QR code " + error.message);
  }
};

const bwipjs = require("bwip-js");
// Generate a barcode and get it as an SVG string
exports.generateBarCode = async (text = "hello") => {
  try {
    if (!text)
      throw new customError(401, "text is required to generate Bar code");
    let svg = bwipjs.toSVG({
      bcid: "code128",
      text: text,
      height: 12,
      includetext: true,
      textxalign: "center",
      textcolor: "#000000",
    });
    return svg;
  } catch (error) {
    throw new customError(500, "Failed to generate Bar code " + error.message);
  }
};
// Example usage:

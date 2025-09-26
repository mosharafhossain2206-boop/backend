const nodemailer = require("nodemailer");
const { customError } = require("./customError");
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV == "developement" ? false : true,
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

exports.mailer = async (subject = "Confrim registration", template, email) => {
  try {
    const info = await transporter.sendMail({
      from: "MernCyclon",
      to: email,
      subject: subject,
      html: template,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.log("from nodemailer file ", error);

    throw new customError(501, "Mail Not Send " + error);
  }
};

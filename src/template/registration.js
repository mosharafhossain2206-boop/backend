exports.registrationTemplate = (name, otp, expiryTime, flink) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Registration OTP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #4f46e5;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 20px;
    }
    .content {
      padding: 20px;
      color: #333333;
      line-height: 1.5;
    }
    .otp-box {
      background: #f3f4f6;
      border: 1px dashed #4f46e5;
      font-size: 24px;
      letter-spacing: 5px;
      text-align: center;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      font-weight: bold;
      color: #4f46e5;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: white !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #4338ca;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777777;
      padding: 15px;
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Registration Verification
    </div>
    <div class="content">
      <p>Hi <strong>{{name}}</strong>,</p>
      <p>Thank you for registering! Please use the following One-Time Password (OTP) to complete your registration:</p>
      <div class="otp-box">{{otp}}</div>
      <p>This OTP will expire in <strong>{{expiryTime}} minutes</strong>.</p>
      <p style="text-align:center;">
        <a href="{{verifyLink}}" class="button" target="_blank">Verify Now</a>
      </p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Welcome aboard,<br>Team {{companyName}}</p>
    </div>
    <div class="footer">
      &copy;  {{companyName}}. All rights reserved.
    </div>
  </div>
</body>
</html>
`
    .replace("{{name}}", name)
    .replace("{{otp}}", otp)
    .replace("{{expiryTime}}", expiryTime)
    .replace("{{verifyLink}}", flink) // your frontend verification link
    .replace(/{{companyName}}/g, "MernCyclon");
};

// resend template

exports.resendTemplate = (name, otp, expiryTime, flink) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resend  OTP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #4f46e5;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 20px;
    }
    .content {
      padding: 20px;
      color: #333333;
      line-height: 1.5;
    }
    .otp-box {
      background: #f3f4f6;
      border: 1px dashed #4f46e5;
      font-size: 24px;
      letter-spacing: 5px;
      text-align: center;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      font-weight: bold;
      color: #4f46e5;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: white !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #4338ca;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777777;
      padding: 15px;
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Registration Verification
    </div>
    <div class="content">
      <p>Hi <strong>{{name}}</strong>,</p>
      <p>Thank you for registering! Please use the following One-Time Password (OTP) to complete your registration:</p>
      <div class="otp-box">{{otp}}</div>
      <p>This OTP will expire in <strong>{{expiryTime}} minutes</strong>.</p>
      <p style="text-align:center;">
        <a href="{{verifyLink}}" class="button" target="_blank">Verify Now</a>
      </p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Welcome aboard,<br>Team {{companyName}}</p>
    </div>
    <div class="footer">
      &copy;  {{companyName}}. All rights reserved.
    </div>
  </div>
</body>
</html>
`
    .replace("{{name}}", name)
    .replace("{{otp}}", otp)
    .replace("{{expiryTime}}", expiryTime)
    .replace("{{verifyLink}}", flink) // your frontend verification link
    .replace(/{{companyName}}/g, "MernCyclon");
};

// reset password
exports.resetPasswordTemplate = (name, resetLink) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset OTP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #dc2626; /* Red to indicate urgency */
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 20px;
    }
    .content {
      padding: 20px;
      color: #333333;
      line-height: 1.5;
    }
    .otp-box {
      background: #f3f4f6;
      border: 1px dashed #dc2626;
      font-size: 24px;
      letter-spacing: 5px;
      text-align: center;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      font-weight: bold;
      color: #dc2626;
    }
    .button {
      display: inline-block;
      background-color: #dc2626;
      color: white !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #b91c1c;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777777;
      padding: 15px;
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Password Reset Request
    </div>
    <div class="content">
      <p>Hi <strong>{{name}}</strong>,</p>
      <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
      <div class="otp-box">{{otp}}</div>
      <p>This OTP will expire in <strong>{{expiryTime}} minutes</strong>.</p>
      <p style="text-align:center;">
        <a href="{{resetLink}}" class="button" target="_blank">Reset Password</a>
      </p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>Stay secure,<br>Team {{companyName}}</p>
    </div>
    <div class="footer">
      &copy;  {{companyName}}. All rights reserved.
    </div>
  </div>
</body>
</html>
`
    .replace("{{name}}", name)
    .replace("{{otp}}", "")
    .replace("{{expiryTime}}", "")
    .replace("{{resetLink}}", resetLink)
    .replace(/{{companyName}}/g, "MernCyclon");
};

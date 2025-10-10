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

// order Template
exports.orderTemplate = (cart, shippingInfo, finalAmount) => {
  console.log(cart.items);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Summary</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f6f9fc;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .email-container {
        max-width: 640px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .header {
        background-color: #007BFF;
        color: #ffffff;
        padding: 30px;
        text-align: center;
      }

      .header h1 {
        margin: 0;
        font-size: 26px;
      }

      .header img {
        max-width: 120px;
        margin-bottom: 10px;
      }

      .content {
        padding: 25px 30px;
      }

      .content p {
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      th, td {
        padding: 14px 12px;
        text-align: left;
        font-size: 15px;
      }

      thead {
        background-color: #f0f4f8;
        border-bottom: 2px solid #e0e6ed;
      }

      tbody tr:nth-child(even) {
        background-color: #f9fbfd;
      }

      tbody tr:last-child {
        font-weight: bold;
        border-top: 2px solid #e0e6ed;
      }

      .footer {
        background-color: #f0f4f8;
        text-align: center;
        padding: 20px;
        font-size: 13px;
        color: #7a7a7a;
      }

      @media only screen and (max-width: 640px) {
        .email-container {
          width: 100% !important;
          border-radius: 0 !important;
        }

        .content {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <!-- Optional Logo -->
        <!-- <img src="https://yourdomain.com/logo.png" alt="Company Logo" /> -->
        <h1>Your Order Summary</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>Hi ${shippingInfo.fullName},</p>
        <p>Thanks for shopping with us! Here's a summary of your order:</p>

        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
          ${cart.items.map((item) => {
            return `<tr>
              <td>${
                item.product ? item.product.name : item.variant.variantName
              }</td>
              <td>${item.quantity}</td>
              <td>${item.totalPrice}</td>
            </tr>`;
          })}
       
            <tr>
              <td colspan="2">Total</td>
              <td>${finalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="footer">
        &copy; 2025 Your Company, Inc. <br />
        123 Business Rd, Business City, BC 12345
      </div>
    </div>
  </body>
</html>
`;
};

// sms template
exports.phoneTemplate = () => {
  return `📦 Order Confirmation
Hello [Customer Name],
Thank you for your order! Here are your order details:
- [Your Company Name]
`;
};

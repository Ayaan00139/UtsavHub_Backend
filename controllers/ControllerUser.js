const SignupColRef = require("../models/ModelSignup");
const SessionColRef = require("../models/ModelSession");
const CitizenColRef = require("../models/ModelCitizen");
const VendorColRef = require("../models/ModelVendor");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")

// Stores active OTPs in server memory (No database needed)
const otpStore = new Map();

const getClientBaseUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:3000';
};

const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  };
};

async function doSignup(req, resp) {
  try {

    const emailid = req.body.emailid
    const password = req.body.password;
    const utype = req.body.utype || req.body.type || "Customer";
    const status = req.body.status || "Active";

    let receiver = emailid;

    if (!emailid || !emailid.trim()) {
      return resp.json({
        status: false,
        msg: "Email ID is required."
      });
    }

    if (!password || !password.trim()) {
      return resp.json({
        status: false,
        msg: "Password is required."
      });
    }

    const trimmedEmail = emailid.trim().toLowerCase();
    console.log(`[User/Signup] Registration request received for: ${trimmedEmail} (Role: ${utype})`);

    const existingUser = await SignupColRef.findOne({
      emailid: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') }
    });

    if (existingUser) {
      console.log(`[User/Signup] Rejected: User already exists with email: ${trimmedEmail}`);
      return resp.json({
        status: false,
        msg: "User with this Email ID already exists."
      });
    }

    const Hpass = await bcrypt.hash(password.trim(), 10);

    const newUser = new SignupColRef({
      emailid: trimmedEmail,
      password: Hpass,
      utype: utype,
      status: status,
      dos: new Date()
    });

    const savedRecord = await newUser.save();
    console.log(`[User/Signup] Successfully registered new user in MongoDB: ${savedRecord.emailid}`);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    })
    const clientBaseUrl = getClientBaseUrl();
    const mailOption = {
      from: `"UtsavHub Support" <${process.env.EMAIL}>`,
      to: receiver,
      subject: "Welcome to UtsavHub – Let's Make Every Celebration Grand! ✨",
      text: `Hello,\n\nWelcome to UtsavHub! We're thrilled to have you join our celebration and vendor ecosystem as a ${utype || 'member'}.\n\nLog in now to explore vendors and manage your events: ${clientBaseUrl}/login\n\nWarm regards,\nThe UtsavHub Team`,
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to UtsavHub</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0F120E; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FDFADF;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0F120E; padding: 40px 15px;">
      <tr>
        <td align="center">
          <!-- Main Email Container -->
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #171B14; border: 1px solid #303929; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            
            <!-- Header with Gold Accent -->
            <tr>
              <td align="center" style="padding: 35px 20px 20px 20px; background: linear-gradient(180deg, #20251C 0%, #171B14 100%); border-bottom: 1px solid #303929;">
                <div style="display: inline-block; padding: 10px 14px; background-color: #121611; border: 1px solid #D0A270; border-radius: 12px; margin-bottom: 12px;">
                  <span style="font-size: 22px; font-weight: bold; color: #FFFFFF; letter-spacing: 1px;">
                    Utsav<span style="color: #D0A270;">Hub</span> ✨
                  </span>
                </div>
                <h1 style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; color: #FFFFFF;">
                  Welcome to the Celebration!
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #CDD5AD; letter-spacing: 0.5px;">
                  DISCOVER VENDORS • CONNECT • CELEBRATE
                </p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 35px 35px 25px 35px;">
                <p style="font-size: 16px; line-height: 1.6; color: #FDFADF; margin: 0 0 16px 0;">
                  Hello <strong>${receiver}</strong>,
                </p>
                <p style="font-size: 14px; line-height: 1.7; color: #CDD5AD; margin: 0 0 24px 0;">
                  Thank you for registering on <strong>UtsavHub</strong>! Your account has been successfully created with the role of <strong style="color: #D0A270;">${utype || 'Member'}</strong>. We are delighted to welcome you to our community.
                </p>

                <!-- Highlight Box -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121611; border-left: 4px solid #D0A270; border-radius: 8px; margin-bottom: 25px; padding: 16px;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #FFFFFF;">
                        What you can do next:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #CDD5AD; line-height: 1.8;">
                        <li><strong>Browse & Connect:</strong> Explore verified top-rated local event vendors.</li>
                        <li><strong>Instant Quotes:</strong> Request caterers, decorators, DJs, and banquet halls.</li>
                        <li><strong>Organize Stress-Free:</strong> Plan your ceremonies and events effortlessly.</li>
                      </ul>
                    </td>
                  </tr>
                </table>

                <!-- Call to Action Button -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0 20px 0;">
                  <tr>
                    <td align="center">
                      <a href="${clientBaseUrl}/login" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 14px; font-weight: bold; text-decoration: none; color: #FFFFFF; background: linear-gradient(90deg, #D0A270 0%, #BF915E 100%); border-radius: 10px; box-shadow: 0 4px 15px rgba(208, 162, 112, 0.35);">
                        Access Your Portal →
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 12px; color: #7D8872; text-align: center; margin: 20px 0 0 0;">
                  If button doesn't work, copy this link: <a href="${clientBaseUrl}/login" style="color: #D0A270;">${clientBaseUrl}/login</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; background-color: #121611; border-top: 1px solid #303929; text-align: center;">
                <p style="font-size: 12px; color: #7D8872; margin: 0 0 6px 0;">
                  Need assistance? Contact our team anytime at <a href="mailto:support@utsavhub.com" style="color: #D0A270; text-decoration: none;">support@utsavhub.com</a>
                </p>
                <p style="font-size: 11px; color: #555E4E; margin: 0;">
                  © 2026 UtsavHub Inc. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `

    };

    // Attempt sending email asynchronously in background so response isn't blocked
    transporter.sendMail(mailOption)
      .then(mailSend => {
        console.log("[ControllerSignup] Welcome email sent successfully:", mailSend.messageId);
      })
      .catch(mailError => {
        console.error("[ControllerSignup] Mail sending failed:", mailError.message || mailError);
      });

    return resp.json({
      status: true,
      msg: "User registered successfully!",
      record: savedRecord
    });
  } catch (err) {
    console.error("[ControllerSignup] Signup Error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message || "Internal server error occurred."
    });
  }
}

async function doLogin(req, resp) {
  try {
    const emailid = req.body.emailid
    const password = req.body.password;

    if (!emailid) {
      return resp.json({
        status: false,
        msg: "Please enter your Email ID."
      });
    }

    if (!password) {
      return resp.json({
        status: false,
        msg: "Please enter your Password."
      });
    }

    const trimmedEmail = emailid.trim().toLowerCase();
    console.log(`[User/Login] Login attempt for: ${trimmedEmail}`);

    const user = await SignupColRef.findOne({
      emailid: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') }
    });

    if (!user) {
      console.log(`[User/Login] Failed: Account not found for ${trimmedEmail}`);
      return resp.json({
        status: false,
        msg: "Invalid Email ID or Password."
      });
    }

    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      console.log(`[User/Login] Failed: Incorrect password for ${trimmedEmail}`);
      return resp.json({
        status: false,
        msg: "Invalid Email ID or Password."
      });
    }

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    const tokenPayload = {
      id: user._id,
      email: trimmedEmail
    };

    const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_KEY, {
      expiresIn: "7d"
    });

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest('hex');

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const session = await SessionColRef.create({
      user: trimmedEmail,
      refreshTokenHash,
      ip: clientIp,
      userAgent: userAgent,
      expiresAt: new Date(Date.now() + SEVEN_DAYS)
    });

    const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_KEY, {
      expiresIn: "15m"
    });

    resp.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    let hasProfile = false;
    const lowerType = String(user.utype || '').toLowerCase();
    if (lowerType.includes('vendor')) {
      const vendorDoc = await VendorColRef.findOne({ vendorMail: trimmedEmail });
      hasProfile = Boolean(vendorDoc);
    } else {
      const citizenDoc = await CitizenColRef.findOne({
        $or: [
          { citizenMail: trimmedEmail },
          { citizenMail: new RegExp(`^${trimmedEmail}$`, 'i') }
        ]
      });
      hasProfile = Boolean(citizenDoc);
    }

    console.log(`[ControllerSignup] User logged in: ${user.emailid} (${user.utype}) - hasProfile: ${hasProfile}`);

    return resp.json({
      status: true,
      msg: "Login Successful!",
      utype: String(user.utype || '').toLowerCase() === 'citizen' ? 'Customer' : (user.utype || "Customer"),
      hasProfile,
      record: user,
      accessToken
    });
  } catch (err) {
    console.error("[ControllerSignup] Login Error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message || "Internal server error occurred."
    });
  }
}


async function doResetPassword(req, resp) {
  try {
    const emailid = req.body.emailid || req.body.email;
    const newPassword = req.body.newPassword 

    if (!emailid || !emailid.trim()) {
      return resp.json({
        status: false,
        msg: "Email ID is required."
      });
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return resp.json({
        status: false,
        msg: "New password must be at least 6 characters long."
      });
    }

    const trimmedEmail = emailid.trim().toLowerCase();
    console.log(`[User/PasswordReset] Password reset submitted for: ${trimmedEmail}`);

    const user = await SignupColRef.findOne({
      emailid: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') }
    });

    if (!user) {
      console.log(`[User/PasswordReset] Rejected: No user found for: ${trimmedEmail}`);
      return resp.json({
        status: false,
        msg: "No account found with this Email ID."
      });
    }

    const record = otpStore.get(trimmedEmail);

    if (!record || !record.verified) {
      console.log(`[User/PasswordReset] Rejected: OTP not verified for: ${trimmedEmail}`);
      return resp.status(403).json({
        status: false,
        msg: "OTP Not Verified"
      });
    }

    // Hash the new password using bcrypt
    const Hpass = await bcrypt.hash(newPassword.trim(), 10);
    user.password = Hpass;
    await user.save();

    // Clean up used OTP from memory
    otpStore.delete(trimmedEmail);

    console.log(`[User/PasswordReset] Password successfully updated in MongoDB for: ${user.emailid}`);
    return resp.json({
      status: true,
      msg: "Password updated successfully! Please login with your new password."
    });
  } catch (err) {
    console.error("[ControllerUser] doResetPassword error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message || "Failed to update password."
    });
  }
}

async function genOtp(req, resp) {
  try {
    let email = req.body.email;

    if (!email || !email.trim()) {
      return resp.json({
        status: false,
        msg: "Please provide an email address."
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log(`[User/OTP] OTP requested for email: ${trimmedEmail}`);

    // Check if user exists in the database
    const existingUser = await SignupColRef.findOne({
      emailid: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') }
    });

    if (!existingUser) {
      console.log(`[User/OTP] Rejected: No user found for: ${trimmedEmail}`);
      return resp.json({
        status: false,
        msg: "No account found with this Email ID. Please register first."
      });
    }

    // Generate a secure 6-digit numeric OTP (e.g. 582914)
    const otp = crypto.randomInt(100000, 1000000).toString();

    otpStore.set(trimmedEmail, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      verified: false
    });

    console.log(`[User/OTP] OTP generated and saved in server memory for: ${trimmedEmail}`);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOption = {
      from: `"UtsavHub Security" <${process.env.EMAIL}>`,
      to: email,
      subject: `Your UtsavHub Verification OTP: ${otp} 🔐`,
      text: `Hello,\n\nYour One-Time Password (OTP) for verification is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share this code with anyone.\n\nWarm regards,\nThe UtsavHub Team`,
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification OTP</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0F120E; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FDFADF;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0F120E; padding: 40px 15px;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #171B14; border: 1px solid #303929; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 35px 20px 20px 20px; background: linear-gradient(180deg, #20251C 0%, #171B14 100%); border-bottom: 1px solid #303929;">
                <div style="display: inline-block; padding: 10px 14px; background-color: #121611; border: 1px solid #D0A270; border-radius: 12px; margin-bottom: 12px;">
                  <span style="font-size: 22px; font-weight: bold; color: #FFFFFF; letter-spacing: 1px;">
                    Utsav<span style="color: #D0A270;">Hub</span> 🔐
                  </span>
                </div>
                <h1 style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; color: #FFFFFF;">
                  OTP Verification Code
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #CDD5AD; letter-spacing: 0.5px;">
                  CONFIRM YOUR IDENTITY
                </p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 35px 35px 25px 35px; text-align: center;">
                <p style="font-size: 16px; line-height: 1.6; color: #FDFADF; margin: 0 0 16px 0; text-align: left;">
                  Hello,
                </p>
                <p style="font-size: 14px; line-height: 1.7; color: #CDD5AD; margin: 0 0 24px 0; text-align: left;">
                  Use the following One-Time Password (OTP) to proceed with your verification. This code is valid for <strong>10 minutes</strong>.
                </p>

                <!-- OTP Display Box -->
                <div style="background-color: #121611; border: 1px dashed #D0A270; border-radius: 12px; padding: 24px; margin: 25px 0; display: inline-block; width: 85%;">
                  <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #D0A270; font-family: 'Courier New', Courier, monospace; display: block;">
                    ${otp}
                  </span>
                </div>

                <p style="font-size: 12px; color: #CDD5AD; opacity: 0.8; margin: 15px 0 0 0;">
                  ⚠️ Do not share this OTP with anyone, including UtsavHub staff.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; background-color: #121611; border-top: 1px solid #303929; text-align: center;">
                <p style="font-size: 12px; color: #7D8872; margin: 0 0 6px 0;">
                  Didn't request this code? You can safely ignore this email.
                </p>
                <p style="font-size: 11px; color: #555E4E; margin: 0;">
                  © 2026 UtsavHub Inc. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
    };

    await transporter.sendMail(mailOption);
    console.log(`[ControllerUser] OTP email sent successfully to: ${email}`);

    return resp.json({
      status: true,
      msg: "OTP sent successfully to your email!"
    });

  } catch (error) {
    console.error("[ControllerUser] genOtp error:", error);
    return resp.status(500).json({
      status: false,
      msg: error.message || "Failed to generate and send OTP."
    });
  }
}

async function getToken(req, resp) {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      console.log("[User/TokenRefresh] Rejected: No refreshToken cookie found");
      return resp.status(401).json({ status: false, msg: "Refresh token not found" });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_KEY);
    } catch (e) {
      console.log("[User/TokenRefresh] Rejected: Invalid or expired refresh token");
      resp.clearCookie("refreshToken");
      return resp.status(401).json({ status: false, msg: "Invalid or expired refresh token" });
    }

    const refreshTokenHash = crypto.createHash("sha256").update(oldRefreshToken).digest("hex");

    const session = await SessionColRef.findOne({
      refreshTokenHash,
      revoked: false
    });

    if (!session) {
      console.log(`[User/TokenRefresh] Rejected: Active session not found in DB for user: ${decoded.email}`);
      resp.clearCookie("refreshToken");
      return resp.status(401).json({ msg: "invalid refresh token, Login In Again" });
    }

    const tokenPayload = {
      ...(decoded.id && { id: decoded.id }),
      email: decoded.email
    };

    const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_KEY, {
      expiresIn: "15m"
    });

    const newRefreshToken = jwt.sign(tokenPayload, process.env.REFRESH_KEY, {
      expiresIn: "7d"
    });

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const newrefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    if (clientIp) session.ip = clientIp;
    if (req.headers['user-agent']) session.userAgent = req.headers['user-agent'];
    session.refreshTokenHash = newrefreshTokenHash;
    session.expiresAt = new Date(Date.now() + SEVEN_DAYS);
    await session.save();

    console.log(`[User/TokenRefresh] Renewed access token and rotated session for: ${decoded.email}`);
    resp.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
    return resp.status(200).json({
      status: true,
      msg: "Access Token Created Successfully",
      accessToken
    });
  } catch (error) {
    console.error("[ControllerUser] getToken error:", error);
    return resp.status(500).json({ status: false, msg: "Failed to refresh token." });
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    console.log("[User/Logout] Logout attempt without refreshToken cookie");
    return res.status(400).json({
      message: "Refresh token not found"
    });
  }
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const session = await SessionColRef.findOne({
    refreshTokenHash,
    revoked: false
  });
  if (!session) {
    console.log("[User/Logout] Session already revoked or not found in DB");
    res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
    return res.status(400).json({
      msg: "Invalid refresh token"
    });
  }
  session.revoked = true;
  await session.save();
  res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
  console.log(`[User/Logout] Revoked session in DB and logged out user: ${session.user}`);
  return res.status(200).json({
    msg: "logged out successfully"
  });
}

async function verifyOtp(req, resp) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp ? String(req.body.otp).trim() : '';
    console.log(`[User/OTP] Verifying OTP submitted for: ${email}`);

    if (!email || !otp) {
      return resp.json({ status: false, msg: "Email and OTP are required." });
    }

    const record = otpStore.get(email);
    if (!record || Date.now() > record.expiresAt) {
      console.log(`[User/OTP] Failed: OTP expired or not found for: ${email}`);
      return resp.json({ status: false, msg: "OTP expired or not found. Please generate a new one." });
    }

    if (record.otp !== otp) {
      console.log(`[User/OTP] Failed: Incorrect OTP entered for: ${email}`);
      return resp.json({
        status: false,
        msg: "Invalid OTP. Please check and try again."
      });
    }

    record.verified = true;
    console.log(`[User/OTP] OTP successfully verified for: ${email}`);

    return resp.json({
      status: true,
      msg: "OTP Verified Successfully!"
    });

  } catch (err) {
    console.error("[ControllerUser] Verify Otp Error:", err);
    return resp.status(500).json({
      status: false,
      msg: err.message || "Failed to verify otp."
    });
  }
}

module.exports = {
  doSignup,
  doLogin,
  doResetPassword,
  genOtp,
  getToken,
  logout,
  verifyOtp
};

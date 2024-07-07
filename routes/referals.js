const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");
const generateUniqueReferralCode = require("../utils/generateReferenceCode");

// POST /referrals endpoint to handle form submission
router.post("/referrals", async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

    // 1. Data Validation
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Basic email format validation (you can add more robust checks)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(referrerEmail) || !emailRegex.test(refereeEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 2. Check if Referrer Exists (by email)
    let referrer = await prisma.referrer.findUnique({
      where: { email: referrerEmail },
    });

    // If not, create a new referrer
    if (!referrer) {
      const referalCode = await generateUniqueReferralCode();
      referrer = await prisma.referrer.create({
        data: {
          name: referrerName,
          email: referrerEmail,
          referralCode: referalCode,
        },
      });
    }

    // 3. Create Referee Record
    const referee = await prisma.referee.create({
      data: {
        name: refereeName,
        email: refereeEmail,
        referrerId: referrer.id,
      },
    });

    // 4. Send Referral Email (using Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: refereeEmail,
      subject: `${referrerName} invited you to join!`,
      text: `Hi ${refereeName},

        Your friend ${referrerName} (${referrerEmail}) has invited you to join our platform.
        Use their referral code ${referrer.referralCode} to get started!`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Referral submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

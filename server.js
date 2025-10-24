import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // sẽ đặt trên Vercel
    pass: process.env.GMAIL_PASS, // App password Gmail
  },
});

// API gửi email
app.post("/send-mail", async (req, res) => {
  const { name, email, course } = req.body;
  try {
    await transporter.sendMail({
      from: `"TA Edu" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Xác nhận đăng ký khóa học",
      html: `<p>Xin chào ${name},</p>
             <p>Bạn đã đăng ký thành công khóa học <b>${course}</b>.</p>
             <p>Hẹn gặp lại tại TA Edu!</p>`,
    });

    console.log("✅ Email sent to:", email);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.json({ success: false, error: err });
  }
});

// Start server local
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));

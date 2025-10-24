import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3000;

// Cho phép Express phục vụ file tĩnh trong thư mục "public"
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route mặc định — chuyển người dùng đến form.html
app.get("/", (req, res) => {
  res.sendFile("form.html", { root: "public" });
});

// Xử lý gửi email (nếu bạn có form gửi email)
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Tin nhắn từ ${name}`,
      text: `Email: ${email}\n\nNội dung:\n${message}`,
    });
    res.status(200).send("Đã gửi email thành công!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Gửi email thất bại!");
  }
});

// Khởi động server (chỉ dùng khi chạy cục bộ)
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));

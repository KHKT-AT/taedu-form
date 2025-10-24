import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Cho phép Express truy cập file tĩnh trong thư mục "public"
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Khi người dùng truy cập "/", trả về form.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

// Xử lý gửi mail
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

app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));

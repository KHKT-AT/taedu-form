export default {
  async fetch(request, env) {
    const { method, url } = request;
    const pathname = new URL(url).pathname;

    // 🩵 1️⃣ Endpoint kiểm tra hệ thống
    if (method === "GET" && pathname === "/ping") {
      return new Response(
        JSON.stringify({ status: "ok", message: "TA-Edu Worker is running 🚀" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 💛 2️⃣ Endpoint nhận yêu cầu học viên
    if (method === "POST" && pathname === "/register-request") {
      try {
        const data = await request.json();
        const { name, email, phone, message } = data;

        if (!name || !email || !phone) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // 🧾 Ghi dữ liệu vào Airtable
        const airtableResponse = await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_REQUESTS}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                Name: name,
                Email: email,
                Phone: phone,
                Message: message || "",
                CreatedAt: new Date().toISOString(),
                Status: "New",
              },
            }),
          }
        );

        const airtableResult = await airtableResponse.json();

        if (!airtableResponse.ok) {
          throw new Error(JSON.stringify(airtableResult));
        }

        // 📧 Gửi email xác nhận bằng Resend
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TA-Edu <no-reply@ta-edu.workers.dev>",
            to: email,
            subject: "Xác nhận đăng ký khóa học TA-Edu",
            html: `
              <p>Xin chào <strong>${name}</strong>,</p>
              <p>TA-Edu đã nhận được yêu cầu học của bạn.</p>
              <p><em>${message}</em></p>
              <p>Chúng tôi sẽ liên hệ sớm nhất qua số điện thoại ${phone}.</p>
              <br/>
              <p>Trân trọng,<br/>Đội ngũ TA-Edu</p>
            `,
          }),
        });

        const resendResult = await resendResponse.json();

        return new Response(
          JSON.stringify({
            success: true,
            airtable_id: airtableResult.id,
            email_status: resendResult,
            message: "Request registered successfully ✅",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "Internal Server Error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 🚫 Xử lý 404 cho các route khác
    return new Response(
      JSON.stringify({ error: "Not Found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  },
};

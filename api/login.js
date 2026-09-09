import { createHmac, timingSafeEqual } from "node:crypto";

const token = () =>
  createHmac("sha256", process.env.ADMIN_PASSWORD || "")
    .update("cost-admin-v1")
    .digest("hex");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak didukung." });
  }
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) {
    return res.status(500).json({ error: "ADMIN_PASSWORD belum diatur di environment Vercel." });
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  let given = "";
  try {
    given = JSON.parse(body).password ?? "";
  } catch {
    /* body bukan JSON */
  }
  const a = Buffer.from(String(given));
  const b = Buffer.from(pass);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Password salah." });
  }
  const secure = req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `cost_admin=${token()}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${secure}`
  );
  res.status(200).json({ ok: true });
}

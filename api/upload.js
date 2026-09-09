import { isAuthed, sb } from "../lib/auth.js";

const MAX_BYTES = 20 * 1024 * 1024;

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Belum login." });
  const db = sb();
  if (!db) return res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur." });
  if (req.method !== "POST") return res.status(405).json({ error: "Metode tidak didukung." });

  const q = new URL(req.url, "http://x").searchParams;
  const mime = q.get("mime") ?? "";
  if (!mime.startsWith("image/")) return res.status(400).json({ error: "Hanya berkas gambar." });
  const name = (q.get("name") ?? "foto.jpg").replace(/[^\w.-]+/g, "_").slice(-80);

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) return res.status(413).json({ error: "Ukuran maksimal 20 MB per foto." });
    chunks.push(chunk);
  }
  if (!size) return res.status(400).json({ error: "Berkas kosong." });

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`;
  const put = await fetch(`${db.url}/storage/v1/object/gallery/${path}`, {
    method: "POST",
    headers: { ...db.headers, "content-type": mime, "x-upsert": "false" },
    body: Buffer.concat(chunks),
  });
  if (!put.ok) return res.status(502).json({ error: `Gagal unggah ke storage (${put.status}).` });

  const row = await fetch(`${db.url}/rest/v1/foto`, {
    method: "POST",
    headers: { ...db.headers, "content-type": "application/json", "content-profile": "public", prefer: "return=minimal" },
    body: JSON.stringify({ path }),
  });
  if (!row.ok) {
    await fetch(`${db.url}/storage/v1/object/gallery/${path}`, { method: "DELETE", headers: db.headers });
    return res.status(502).json({ error: "Gagal menyimpan daftar foto." });
  }
  res.status(200).json({ ok: true, path });
}

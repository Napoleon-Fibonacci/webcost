import { isAuthed, sb } from "../lib/auth.js";

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Belum login." });
  const db = sb();
  if (!db) return res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur." });
  if (req.method !== "POST") return res.status(405).json({ error: "Metode tidak didukung." });

  let body = "";
  for await (const chunk of req) body += chunk;
  let path = "";
  try {
    path = String(JSON.parse(body).path ?? "");
  } catch {
    /* bukan JSON */
  }
  if (!/^[\w.\- ]+$/.test(path)) return res.status(400).json({ error: "Nama berkas tidak valid." });

  await fetch(`${db.url}/storage/v1/object/gallery/${encodeURIComponent(path)}`, {
    method: "DELETE",
    headers: db.headers,
  });
  await fetch(`${db.url}/rest/v1/foto?path=eq.${encodeURIComponent(path)}`, {
    method: "DELETE",
    headers: db.headers,
  });
  res.status(200).json({ ok: true });
}

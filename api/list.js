import { isAuthed, sb } from "../lib/auth.js";

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Belum login." });
  const db = sb();
  if (!db) return res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur." });
  const r = await fetch(
    `${db.url}/rest/v1/foto?select=path,created_at&order=created_at.desc`,
    { headers: { ...db.headers, accept: "application/json" } }
  );
  const rows = await r.json();
  res.status(r.ok ? 200 : 502).json(r.ok ? rows : { error: "Gagal membaca daftar foto." });
}

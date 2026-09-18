import { isAuthed, sb } from "../lib/auth.js";

async function bacaBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Belum login." });
  const db = sb();
  if (!db) return res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur." });

  if (req.method === "GET") {
    const r = await fetch(`${db.url}/rest/v1/kesan_pesan?select=*&order=created_at.desc`, {
      headers: { ...db.headers, accept: "application/json" },
    });
    const rows = await r.json();
    return res.status(r.ok ? 200 : 502).json(r.ok ? rows : { error: "Gagal membaca pesan." });
  }

  if (req.method === "DELETE") {
    const body = await bacaBody(req);
    const id = Number(body.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Id pesan tidak valid." });
    const r = await fetch(`${db.url}/rest/v1/kesan_pesan?id=eq.${id}`, {
      method: "DELETE",
      headers: db.headers,
    });
    return res.status(r.ok ? 200 : 502).json(r.ok ? { ok: true } : { error: "Gagal menghapus pesan." });
  }

  return res.status(405).json({ error: "Metode tidak didukung." });
}

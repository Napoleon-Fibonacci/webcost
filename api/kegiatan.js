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

const headersJson = (db, extra = {}) => ({
  ...db.headers,
  "content-type": "application/json",
  "content-profile": "public",
  ...extra,
});

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Belum login." });
  const db = sb();
  if (!db) return res.status(500).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur." });

  if (req.method === "GET") {
    const r = await fetch(`${db.url}/rest/v1/kegiatan?select=*&order=urutan.asc`, {
      headers: { ...db.headers, accept: "application/json" },
    });
    const rows = await r.json();
    return res.status(r.ok ? 200 : 502).json(r.ok ? rows : { error: "Gagal membaca kegiatan." });
  }

  const body = await bacaBody(req);

  if (req.method === "POST") {
    const judul = String(body.judul ?? "").trim();
    if (!judul) return res.status(400).json({ error: "Judul kegiatan wajib diisi." });
    const data = {
      judul,
      deskripsi: body.deskripsi?.trim() || null,
      tanggal: body.tanggal || null,
      foto_url: body.foto_path
        ? `${db.url}/storage/v1/object/public/gallery/${encodeURIComponent(body.foto_path)}`
        : null,
    };
    if (body.id) {
      const id = Number(body.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: "Id kegiatan tidak valid." });
      const r = await fetch(`${db.url}/rest/v1/kegiatan?id=eq.${id}`, {
        method: "PATCH",
        headers: headersJson(db, { prefer: "return=minimal" }),
        body: JSON.stringify(data),
      });
      return res.status(r.ok ? 200 : 502).json(r.ok ? { ok: true } : { error: "Gagal memperbarui kegiatan." });
    }
    const r = await fetch(`${db.url}/rest/v1/kegiatan`, {
      method: "POST",
      headers: headersJson(db, { prefer: "return=minimal" }),
      body: JSON.stringify([{ ...data, urutan: Math.floor(Date.now() / 1000) }]),
    });
    return res.status(r.ok ? 200 : 502).json(r.ok ? { ok: true } : { error: "Gagal menyimpan kegiatan." });
  }

  if (req.method === "DELETE") {
    const id = Number(body.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Id kegiatan tidak valid." });
    const r = await fetch(`${db.url}/rest/v1/kegiatan?id=eq.${id}`, {
      method: "DELETE",
      headers: db.headers,
    });
    return res.status(r.ok ? 200 : 502).json(r.ok ? { ok: true } : { error: "Gagal menghapus kegiatan." });
  }

  return res.status(405).json({ error: "Metode tidak didukung." });
}

import { createHmac } from "node:crypto";

export function isAuthed(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const expected = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("cost-admin-v1")
    .digest("hex");
  const match = /(?:^|;\s*)cost_admin=([a-f0-9]+)/.exec(req.headers.cookie ?? "");
  return match?.[1] === expected;
}

export function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return {
    url,
    key,
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  };
}

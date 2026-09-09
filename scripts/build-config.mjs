import { writeFileSync } from "node:fs";

const url = process.env.SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

const out =
  "// Dihasilkan oleh npm run build. Jangan diedit manual dan jangan di-commit.\n" +
  `window.SUPABASE_URL = ${JSON.stringify(url)};\n` +
  `window.SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};\n`;

writeFileSync(new URL("../public/js/config.js", import.meta.url), out);

if (!url || !anonKey) {
  console.warn(
    "SUPABASE_URL / SUPABASE_ANON_KEY kosong. config.js diisi string kosong, situs jalan tanpa basis data."
  );
} else {
  console.log("config.js berhasil dibuat.");
}

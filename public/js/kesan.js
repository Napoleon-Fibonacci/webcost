const $ = (id) => document.getElementById(id);

const siap = () =>
  Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);

const form = $("kps-form");
const status = $("kps-status");

if (!siap()) $("kps-offline").hidden = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!siap()) {
    status.textContent = "Formulir belum terhubung ke basis data.";
    return;
  }
  const pesan = $("kps-pesan").value.trim();
  if (!pesan) {
    status.textContent = "Pesan wajib diisi.";
    return;
  }
  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  $("kps-kirim").disabled = true;
  status.textContent = "Mengirim…";
  const { error } = await client.from("kesan_pesan").insert({
    nama: $("kps-nama").value.trim(),
    kesan: form.querySelector("input[name='kesan']:checked")?.value ?? null,
    pesan,
    saran: $("kps-saran").value.trim() || null,
  });
  $("kps-kirim").disabled = false;
  if (error) {
    status.textContent = "Gagal mengirim: " + error.message;
    return;
  }
  form.hidden = true;
  $("kps-sukses").hidden = false;
});

$("kps-lagi").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  $("kps-sukses").hidden = true;
  status.textContent = "";
});

const $ = (id) => document.getElementById(id);

const siap = () =>
  Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);

const form = $("kps-form");
const status = $("kps-status");
const selTingkat = $("kps-tingkat");
const selNomor = $("kps-nomor");
const tanpaKelas = $("kps-tanpa-kelas");

// isi nomor kelas 1-12 sesuai tingkat terpilih (X1..XII12)
function isiNomor(tingkat) {
  selNomor.innerHTML = '<option value="">Pilih nomor…</option>';
  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${tingkat}${i}`;
    selNomor.appendChild(opt);
  }
  selNomor.disabled = false;
}

selTingkat.addEventListener("change", () => {
  if (selTingkat.value) isiNomor(selTingkat.value);
  else {
    selNomor.innerHTML = '<option value="">Pilih nomor…</option>';
    selNomor.disabled = true;
  }
});

tanpaKelas.addEventListener("change", () => {
  const rahasia = tanpaKelas.checked;
  selTingkat.disabled = rahasia;
  selNomor.disabled = rahasia || !selTingkat.value;
  if (rahasia) {
    selTingkat.value = "";
    selNomor.innerHTML = '<option value="">Pilih nomor…</option>';
  }
});

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
  const tingkat = tanpaKelas.checked ? "" : selTingkat.value;
  const nomor = tanpaKelas.checked ? "" : selNomor.value;
  const kelas = tingkat && nomor ? `${tingkat}${nomor}` : null;
  const nama = $("kps-nama").value.trim();
  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  $("kps-kirim").disabled = true;
  status.textContent = "Mengirim…";
  const { error } = await client.from("kesan_pesan").insert({
    nama: nama || "Anonim",
    kelas,
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
  selNomor.innerHTML = '<option value="">Pilih nomor…</option>';
  selNomor.disabled = true;
  form.hidden = false;
  $("kps-sukses").hidden = true;
  status.textContent = "";
});

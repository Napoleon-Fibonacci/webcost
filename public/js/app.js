const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]
  );

const client =
  window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : null;

const EMPTY = "Belum ada data. Tambahkan lewat Supabase Table Editor.";
const OFFLINE =
  "Basis data belum terhubung. Setel environment variable Supabase di Vercel, lalu deploy ulang.";

async function rows(table, orderColumn, ascending = true) {
  if (!client) return null;
  let query = client.from(table).select("*");
  if (orderColumn) query = query.order(orderColumn, { ascending });
  const { data, error } = await query;
  if (error) {
    console.error(`Gagal memuat tabel ${table}: ${error.message}`);
    return null;
  }
  return data;
}

function renderTextBlock(el, text) {
  el.innerHTML = text ? esc(text).replace(/\n/g, "<br>") : "";
}

function showMessage(el, message) {
  el.innerHTML = `<p class="muted">${message}</p>`;
}

function dateParts(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    d: date.getDate(),
    m: date.toLocaleDateString("id-ID", { month: "short" }),
    y: date.getFullYear(),
  };
}

async function init() {
  const settings = Object.fromEntries(
    (await rows("pengaturan"))?.map((r) => [r.key, r.value]) ?? []
  );
  if (settings.tagline) {
    document.querySelector(".brand-tag").textContent = settings.tagline;
  }
  for (const key of ["ringkasan_home"]) {
    const el = document.querySelector(`[data-fill="${key}"]`);
    if (el && settings[key]) renderTextBlock(el, settings[key]);
  }

  const statusTanpaDb = client ? EMPTY : OFFLINE;

  const kegiatan = await rows("kegiatan", "urutan");
  const kegiatanBox = document.getElementById("kegiatan-list");
  if (!kegiatan) showMessage(kegiatanBox, statusTanpaDb);
  else if (!kegiatan.length) showMessage(kegiatanBox, EMPTY);
  else {
    kegiatanBox.innerHTML = kegiatan
      .map((k) => {
        const tgl = dateParts(k.tanggal);
        const tanggal = tgl
          ? `<div class="entry-date"><span class="d">${tgl.d}</span><span class="m">${esc(
              tgl.m
            )}</span><span class="y">${tgl.y}</span></div>`
          : "";
        const foto = k.foto_url ? `<img src="${esc(k.foto_url)}" alt="${esc(k.judul)}">` : "";
        const deskripsi = k.deskripsi ? `<p>${esc(k.deskripsi)}</p>` : "";
        return `<article class="entry">${tanggal}<div class="entry-body"><h3>${esc(
          k.judul
        )}</h3>${deskripsi}${foto}</div></article>`;
      })
      .join("");
  }

  watchSections();
  watchSketch();
}

init();

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

const KONTAK_LABEL = {
  instagram: "Instagram",
  email: "Email",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  lain: "Kontak",
};

function kontakHref(jenis, nilai) {
  if (jenis === "email") return `mailto:${nilai}`;
  if (jenis === "whatsapp") {
    return /^https?:\/\//.test(nilai) ? nilai : `https://wa.me/${String(nilai).replace(/\D/g, "")}`;
  }
  return /^https?:\/\//.test(nilai) ? nilai : `https://${nilai}`;
}

function watchSections() {
  const links = new Map(
    [...document.querySelectorAll(".site-nav a")].map((a) => [a.getAttribute("href").slice(1), a])
  );
  const sections = [...links.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links.values()) link.classList.remove("active");
        links.get(entry.target.id)?.classList.add("active");
      }
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => observer.observe(s));
}

function watchSketch() {
  const sketch = document.querySelector(".sketch");
  if (!sketch) return;
  if (!("IntersectionObserver" in window)) {
    sketch.classList.add("drawing");
    return;
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        sketch.classList.add("drawing");
        io.disconnect();
      }
    },
    { threshold: 0.35 }
  );
  io.observe(sketch);
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

  const kontak = await rows("kontak", "urutan");
  const inline = document.querySelector('[data-fill="kontak_inline"]');
  if (inline) {
    inline.innerHTML = (kontak ?? [])
      .map(
        (k) =>
          `<a href="${esc(kontakHref(k.jenis, k.nilai))}">${esc(KONTAK_LABEL[k.jenis] ?? k.jenis)}</a>`
      )
      .join("");
  }
  const kontakBox = document.getElementById("kontak-list");
  if (!kontak) showMessage(kontakBox, statusTanpaDb);
  else if (!kontak.length) showMessage(kontakBox, EMPTY);
  else {
    kontakBox.innerHTML = kontak
      .map(
        (k) =>
          `<div class="kontak-row"><span class="kontak-jenis">${esc(
            KONTAK_LABEL[k.jenis] ?? k.jenis
          )}</span><a class="kontak-nilai" href="${esc(
            kontakHref(k.jenis, k.nilai)
          )}">${esc(k.nilai)}</a></div>`
      )
      .join("");
  }

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

  const prestasi = await rows("prestasi", "tahun", false);
  const prestasiBox = document.getElementById("prestasi-list");
  if (!prestasi) showMessage(prestasiBox, statusTanpaDb);
  else if (!prestasi.length) showMessage(prestasiBox, EMPTY);
  else {
    prestasiBox.innerHTML = prestasi
      .map((p) => {
        const foto = p.foto_url ? `<img src="${esc(p.foto_url)}" alt="${esc(p.nama)}">` : "";
        const detail = [p.posisi, p.tingkat].filter(Boolean).map(esc).join(", ");
        return `<article class="entry"><div class="entry-year">${esc(p.tahun ?? "")}</div><div class="entry-body"><h3>${esc(
          p.nama
        )}</h3>${detail ? `<p class="meta">${detail}</p>` : ""}${foto}</div></article>`;
      })
      .join("");
  }

  watchSections();
  watchSketch();
}

init();

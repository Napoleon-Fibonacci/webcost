const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]
  );

const client =
  window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : null;

let galeriData = [];

const EMPTY = "Belum ada data. Tambahkan lewat Supabase Table Editor.";
const OFFLINE =
  "Basis data belum terhubung. Setel environment variable Supabase di Vercel, lalu deploy ulang.";

async function rows(table, orderColumn, ascending = true, limit) {
  if (!client) return null;
  let query = client.from(table).select("*");
  if (orderColumn) query = query.order(orderColumn, { ascending });
  if (limit) query = query.limit(limit);
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

function tanggalPendek(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function initLightbox() {
  const box = document.getElementById("galeri-grid");
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");
  if (!box || !lb || !img) return;
  let idx = 0;
  const tampil = (i) => {
    if (!galeriData.length) return;
    idx = (i + galeriData.length) % galeriData.length;
    img.src = galeriData[idx].url;
    img.alt = `Foto kegiatan COST ${idx + 1}`;
    if (caption) {
      const tgl = tanggalPendek(galeriData[idx].tanggal);
      caption.textContent = tgl
        ? `Foto ${idx + 1} dari ${galeriData.length}, ${tgl}`
        : `Foto ${idx + 1} dari ${galeriData.length}`;
    }
  };
  const tutup = () => {
    lb.hidden = true;
    img.src = "";
  };
  box.addEventListener("click", (e) => {
    const item = e.target.closest(".galeri-item");
    if (!item) return;
    tampil(Number(item.dataset.idx) || 0);
    lb.hidden = false;
    document.getElementById("lightbox-close").focus();
  });
  document.getElementById("lightbox-prev").addEventListener("click", () => tampil(idx - 1));
  document.getElementById("lightbox-next").addEventListener("click", () => tampil(idx + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) tutup();
  });
  document.getElementById("lightbox-close").addEventListener("click", tutup);
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") tutup();
    if (e.key === "ArrowLeft") tampil(idx - 1);
    if (e.key === "ArrowRight") tampil(idx + 1);
  });
}

function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

function initMenu() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    })
  );
}

function watchSections() {
  const links = document.querySelectorAll(".site-nav a[href^='#']");
  const sections = Array.from(links)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;
  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((sec) => io.observe(sec));
}

function watchSketch() {
  const sketch = document.querySelector(".sketch");
  if (!sketch || !("IntersectionObserver" in window)) {
    if (sketch) sketch.classList.add("drawing");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("drawing");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
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

  
  const galeri = await rows("foto", "created_at", false, 12);
  galeriData = (galeri ?? []).map((f) => ({
    url: client.storage.from("gallery").getPublicUrl(f.path).data.publicUrl,
    tanggal: f.created_at,
  }));
  const galeriBox = document.getElementById("galeri-grid");
  if (!galeri) showMessage(galeriBox, statusTanpaDb);
  else if (!galeri.length) showMessage(galeriBox, "Belum ada foto. Pengurus menambahnya lewat halaman /admin.");
  else {
  galeriBox.innerHTML = galeriData
    .map(
      (g, i) =>
        `<button class="galeri-item" type="button" data-idx="${i}" aria-label="Buka foto ${i + 1}">` +
        `<span class="g-frame"><img src="${esc(g.url)}" alt="" loading="lazy"></span>` +
        `<span class="g-strip"><span class="g-num">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="g-tgl">${esc(tanggalPendek(g.tanggal))}</span></span></button>`
    )
    .join("");
  }
  initLightbox();
}

function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("revealed");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}
const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]
  );

const $ = (id) => document.getElementById(id);

function showApp(on) {
  $("login").hidden = on;
  $("panel").hidden = !on;
}

async function api(url, options = {}) {
  const r = await fetch(url, options);
  let data = {};
  try {
    data = await r.json();
  } catch {
    /* respons kosong */
  }
  if (!r.ok) {
    const err = new Error(data.error || `Kesalahan ${r.status}.`);
    err.status = r.status;
    throw err;
  }
  return data;
}

const fotoUrl = (path) =>
  `${window.SUPABASE_URL}/storage/v1/object/public/gallery/${encodeURIComponent(path)}`;

let galleryPaths = [];
let selectedPath = "";
let kegiatanRows = [];
let editingId = "";

const PANEL_TAB = {
  "tab-galeri": "isi-galeri",
  "tab-kegiatan": "isi-kegiatan",
  "tab-kesan": "isi-kesan",
};

document.querySelectorAll(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((t) => {
      t.setAttribute("aria-selected", String(t === tab));
    });
    for (const [tabId, panelId] of Object.entries(PANEL_TAB)) {
      $(panelId).hidden = tabId !== tab.id;
    }
    if (tab.id === "tab-kesan") {
      muatKesan().catch((e) => {
        $("kesan-list").innerHTML = `<p class="error">${esc(e.message)}</p>`;
      });
    }
  });
});

function renderAdminGrid() {
  const grid = $("admin-grid");
  if (!galleryPaths.length) {
    grid.innerHTML = '<p class="muted">Belum ada foto. Tarik file ke kotak di atas.</p>';
    return;
  }
  grid.innerHTML = galleryPaths
    .map(
      (p) =>
        `<div class="admin-item"><img src="${esc(fotoUrl(p))}" alt="" loading="lazy"><button class="btn-danger" type="button" data-path="${esc(p)}">Hapus</button></div>`
    )
    .join("");
}

function renderPicker() {
  const box = $("k-picker");
  if (!galleryPaths.length) {
    box.innerHTML = '<p class="muted">Belum ada foto di galeri. Unggah lewat tab Foto Galeri dulu.</p>';
    return;
  }
  box.innerHTML =
    `<button type="button" class="p-kosong" data-path="" aria-pressed="${selectedPath === ""}">Tanpa foto</button>` +
    galleryPaths
      .map(
        (p) =>
          `<button type="button" data-path="${esc(p)}" aria-pressed="${selectedPath === p}"><img src="${esc(fotoUrl(p))}" alt=""></button>`
      )
      .join("");
}

async function muatGallery() {
  galleryPaths = (await api("/api/list")).map((f) => f.path);
  renderAdminGrid();
  renderPicker();
}

function tanggalPanjang(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function renderKegiatan() {
  const box = $("k-list");
  if (!kegiatanRows.length) {
    box.innerHTML = '<p class="muted">Belum ada kegiatan. Isi formulir di atas untuk menambah.</p>';
    return;
  }
  box.innerHTML = kegiatanRows
    .map((k) => {
      const tgl = tanggalPanjang(k.tanggal);
      const thumb = k.foto_url ? `<img class="k-thumb" src="${esc(k.foto_url)}" alt="" loading="lazy">` : "";
      return `<div class="k-row"><div class="k-info"><h4>${esc(k.judul)}</h4>${
        tgl ? `<p class="meta">${esc(tgl)}</p>` : ""
      }${thumb}</div><div class="k-actions"><button class="btn-mini" type="button" data-edit="${esc(k.id)}">Ubah</button><button class="btn-mini danger" type="button" data-del="${esc(k.id)}" data-judul="${esc(k.judul)}">Hapus</button></div></div>`;
    })
    .join("");
}

async function muatKegiatan() {
  kegiatanRows = await api("/api/kegiatan");
  renderKegiatan();
}

let kesanDimuat = false;

async function muatKesan() {
  const rows = await api("/api/kesan");
  const box = $("kesan-list");
  if (!rows.length) {
    box.innerHTML = '<p class="muted">Belum ada pesan masuk.</p>';
  } else {
    box.innerHTML = rows
      .map((k) => {
        const tgl = tanggalPanjang(k.created_at);
        const chip = k.kesan ? `<span class="chip-tag">${esc(k.kesan)}</span>` : "";
        const pesan = k.pesan ? `<p class="p-pesan">“${esc(k.pesan)}”</p>` : "";
        const saran = k.saran ? `<p class="p-saran">Saran: ${esc(k.saran)}</p>` : "";
        return `<div class="k-row"><div class="k-info"><h4>${esc(k.nama)}${chip}</h4>${
          tgl ? `<p class="meta">${esc(tgl)}</p>` : ""
        }${pesan}${saran}</div><div class="k-actions"><button class="btn-mini danger" type="button" data-del="${esc(k.id)}" data-nama="${esc(k.nama)}">Hapus</button></div></div>`;
      })
      .join("");
  }
  kesanDimuat = true;
}

function mulaiEdit(id) {
  const k = kegiatanRows.find((r) => String(r.id) === String(id));
  if (!k) return;
  editingId = String(k.id);
  $("k-id").value = k.id;
  $("k-judul").value = k.judul ?? "";
  $("k-tanggal").value = k.tanggal ?? "";
  $("k-deskripsi").value = k.deskripsi ?? "";
  selectedPath = "";
  if (k.foto_url) {
    const cocok = galleryPaths.find((p) => fotoUrl(p) === k.foto_url);
    if (cocok) selectedPath = cocok;
  }
  renderPicker();
  $("k-simpan").textContent = "Perbarui Kegiatan";
  $("k-batal").hidden = false;
  $("k-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

function batalEdit() {
  editingId = "";
  $("k-form").reset();
  $("k-id").value = "";
  selectedPath = "";
  renderPicker();
  $("k-simpan").textContent = "Simpan Kegiatan";
  $("k-batal").hidden = true;
}

$("k-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("k-status");
  status.textContent = "Menyimpan…";
  try {
    await api("/api/kegiatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId || undefined,
        judul: $("k-judul").value,
        tanggal: $("k-tanggal").value || null,
        deskripsi: $("k-deskripsi").value,
        foto_path: selectedPath || null,
      }),
    });
    status.textContent = editingId ? "Kegiatan diperbarui." : "Kegiatan tersimpan.";
    batalEdit();
    await muatKegiatan();
  } catch (err) {
    status.textContent = err.message;
  }
});

$("k-batal").addEventListener("click", batalEdit);

$("k-list").addEventListener("click", async (e) => {
  const ubah = e.target.closest("button[data-edit]");
  if (ubah) {
    mulaiEdit(ubah.dataset.edit);
    return;
  }
  const hapusBtn = e.target.closest("button[data-del]");
  if (hapusBtn && window.confirm(`Hapus kegiatan "${hapusBtn.dataset.judul}"?`)) {
    try {
      await api("/api/kegiatan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(hapusBtn.dataset.del) }),
      });
      await muatKegiatan();
    } catch (err) {
      $("k-status").textContent = err.message;
    }
  }
});

$("k-picker").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-path]");
  if (!btn) return;
  selectedPath = btn.dataset.path;
  renderPicker();
});

async function refreshGrid() {
  try {
    await muatGallery();
  } catch (e) {
    $("admin-grid").innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.87;
const KOMPRESS_ABOVE = 600 * 1024;

// Foto besar di-resize + dikompres di browser sebelum dikirim,
// supaya galeri tetap tajam (maks sisi 1920px) tapi ringan diunduh.
function kompresFile(file) {
  if (file.type === "image/gif") return Promise.resolve(file);
  if (file.size <= KOMPRESS_ABOVE) return Promise.resolve(file);
  return createImageBitmap(file)
    .then((bmp) => {
      const skala = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * skala);
      const h = Math.round(bmp.height * skala);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, w, h);
      bmp.close?.();
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) return resolve(file);
            const ext = file.type === "image/png" ? ".png" : ".jpg";
            const nama = file.name.replace(/\.[^.]+$/, "") + ext;
            resolve(new File([blob], nama, { type: blob.type }));
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      });
    })
    .catch(() => file);
}

async function upload(files) {
  const list = [...files].filter((f) => f.type.startsWith("image/"));
  if (!list.length) return;
  const status = $("upload-status");
  for (let i = 0; i < list.length; i++) {
    status.textContent = `Memproses ${i + 1} dari ${list.length}…`;
    let file = list[i];
    try {
      file = await kompresFile(file);
    } catch {
      /* pakai berkas asli bila kompresi gagal */
    }
    status.textContent = `Mengunggah ${i + 1} dari ${list.length}…`;
    try {
      await api(
        `/api/upload?name=${encodeURIComponent(file.name)}&mime=${encodeURIComponent(file.type)}`,
        { method: "POST", body: file }
      );
    } catch (e) {
      status.textContent = `Gagal unggah ${list[i].name}: ${e.message}`;
    }
  }
  status.textContent = "Semua foto terunggah.";
  await refreshGrid();
}

async function hapus(path) {
  const status = $("upload-status");
  status.textContent = "Menghapus foto…";
  try {
    await api("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    status.textContent = "";
  } catch (e) {
    status.textContent = e.message;
  }
  await refreshGrid();
}

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("login-msg").textContent = "";
  try {
    await api("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: $("password").value }),
    });
    showApp(true);
    await Promise.all([
      refreshGrid(),
      muatKegiatan().catch((err) => {
        $("k-list").innerHTML = `<p class="error">${esc(err.message)}</p>`;
      }),
      muatKesan().catch(() => {
        $("kesan-list").innerHTML = '<p class="muted">Belum bisa memuat pesan.</p>';
      }),
    ]);
  } catch (e) {
    $("login-msg").textContent = e.message;
  }
});

$("logout").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  showApp(false);
});

const dz = $("dropzone");
dz.addEventListener("click", () => $("file-input").click());
dz.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    $("file-input").click();
  }
});
["dragover", "dragenter"].forEach((ev) =>
  dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.add("over");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.remove("over");
  })
);
dz.addEventListener("drop", (e) => upload(e.dataTransfer.files));
$("file-input").addEventListener("change", (e) => upload(e.target.files));

$("admin-grid").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-path]");
  if (btn) hapus(btn.dataset.path);
});

$("kesan-list").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-del]");
  if (!btn) return;
  if (!window.confirm(`Hapus pesan dari "${btn.dataset.nama}"?`)) return;
  try {
    await api("/api/kesan", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(btn.dataset.del) }),
    });
    await muatKesan();
  } catch (err) {
    $("kesan-status").textContent = err.message;
  }
});

api("/api/list")
  .then(async () => {
    showApp(true);
    await Promise.all([refreshGrid(), muatKegiatan().catch(() => {}), muatKesan().catch(() => {})]);
  })
  .catch((e) => {
    showApp(false);
    if (e.status !== 401) $("login-msg").textContent = e.message;
  });

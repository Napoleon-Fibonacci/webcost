const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]
  );

const $ = (id) => document.getElementById(id);

if (!window.SUPABASE_URL) {
  $("login").hidden = true;
  $("no-db").hidden = false;
}

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

async function refreshGrid() {
  const grid = $("admin-grid");
  try {
    const rowsData = await api("/api/list");
    if (!rowsData.length) {
      grid.innerHTML = '<p class="muted">Belum ada foto. Tarik file ke kotak di atas.</p>';
      return;
    }
    grid.innerHTML = rowsData
      .map(
        (f) =>
          `<div class="admin-item"><img src="${esc(fotoUrl(f.path))}" alt="" loading="lazy"><button class="btn-danger" type="button" data-path="${esc(f.path)}">Hapus</button></div>`
      )
      .join("");
  } catch (e) {
    grid.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function upload(files) {
  const list = [...files].filter((f) => f.type.startsWith("image/"));
  if (!list.length) return;
  const status = $("upload-status");
  for (let i = 0; i < list.length; i++) {
    status.textContent = `Mengunggah ${i + 1} dari ${list.length}…`;
    try {
      await api(
        `/api/upload?name=${encodeURIComponent(list[i].name)}&mime=${encodeURIComponent(list[i].type)}`,
        { method: "POST", body: list[i] }
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
    await refreshGrid();
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

api("/api/list")
  .then(() => {
    showApp(true);
    return refreshGrid();
  })
  .catch((e) => {
    showApp(false);
    if (e.status !== 401) $("login-msg").textContent = e.message;
  });

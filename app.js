// Lavado Pro — v5  (2026 refresh)
// ─────────────────────────────────────────────────────────────

// ── Data ──────────────────────────────────────────────────────
const categories = [
  { id: "deportiva",       label: "Ropa deportiva",    icon: "🏃" },
  { id: "delicada",        label: "Delicada/lencería", icon: "🌸" },
  { id: "jeans",           label: "Jeans/mezclilla",   icon: "👖" },
  { id: "bedding",         label: "Ropa de cama",      icon: "🛏️" },
  { id: "cobijaElectrica", label: "Cobija eléctrica",  icon: "🔌" },
  { id: "tapetes",         label: "Tapetes textiles",  icon: "🪵" },
  { id: "toallas",         label: "Toallas",           icon: "🚿" },
  { id: "traposCocina",    label: "Trapos de cocina",  icon: "🍳" },
  { id: "pijamas",         label: "Pijamas",           icon: "😴" },
  { id: "mixta",           label: "Carga mixta",       icon: "🧺" },
];

const fabrics = [
  { id: "algodon",    label: "Algodón / jersey",         icon: "🌿" },
  { id: "modal",      label: "Modal / viscosa / rayón",  icon: "🪷" },
  { id: "satin",      label: "Satín / seda sintética",   icon: "✨" },
  { id: "franela",    label: "Franela / polar",          icon: "🧸" },
  { id: "mezclilla",  label: "Mezclilla / lona",         icon: "🧵" },
  { id: "microfibra", label: "Microfibra / poliéster",   icon: "⚗️" },
];

const AUTOSUGGEST = [
  "trapos de cocina", "tapetes textiles", "toallas", "cobija eléctrica",
  "cobija de masaje con aceite", "edredón", "sábanas", "jeans",
  "pijamas", "ropa deportiva", "ropa delicada", "carga mixta",
];

// ── State ─────────────────────────────────────────────────────
const state = {
  category: null, fabric: null, soil: "light",
  steam: "auto", hsteam: "auto", rinse: "auto",
  oil: false, smartthings: false, desc: "", dryer: "auto",
};

// ── DOM helpers ───────────────────────────────────────────────
const steps = [...document.querySelectorAll(".step")];

function goto(i) {
  steps.forEach((s, k) => (s.hidden = k !== i - 1));
  updateProgress(i);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProgress(step) {
  const dots = document.querySelectorAll(".progress-dot");
  const bar  = document.getElementById("progressDots");
  dots.forEach((d, k) => {
    d.classList.remove("active", "done");
    if (k + 1 === step) d.classList.add("active");
    else if (k + 1 < step) d.classList.add("done");
  });
  if (bar) bar.setAttribute("aria-valuenow", step);
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Chip rendering ────────────────────────────────────────────
function renderChips(groupId, items, key) {
  const el = document.getElementById(groupId);
  el.innerHTML = "";
  items.forEach(it => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = `<span class="chip-icon">${it.icon || ""}</span><span>${it.label}</span>`;
    b.dataset.id = it.id;
    b.addEventListener("click", () => {
      [...el.querySelectorAll("button")].forEach(x => {
        x.classList.remove("active");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("active");
      b.setAttribute("aria-pressed", "true");
      state[key] = it.id;
    });
    el.appendChild(b);
  });
}

function activateChip(groupId, itemId, items) {
  const group = document.getElementById(groupId);
  const buttons = [...group.querySelectorAll("button")];
  const list = items || categories;
  const idx = list.findIndex(c => c.id === itemId);
  if (idx >= 0 && buttons[idx]) {
    buttons.forEach(x => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
    buttons[idx].classList.add("active");
    buttons[idx].setAttribute("aria-pressed", "true");
  }
}

// ── Segmented controls ────────────────────────────────────────
function seg(id, key, attr) {
  const el = document.getElementById(id);
  el.addEventListener("click", e => {
    if (e.target.tagName !== "BUTTON") return;
    [...el.querySelectorAll("button")].forEach(x => x.classList.remove("active"));
    e.target.classList.add("active");
    state[key] = e.target.dataset[attr];
  });
}

// ── Navigation ────────────────────────────────────────────────
function next() {
  const cur = steps.findIndex(s => !s.hidden) + 1;
  if (cur === 1 && !state.category) {
    const desc = (document.getElementById("desc").value || "").toLowerCase();
    if (desc.trim().length > 0) {
      state.category = inferCategory(desc);
      activateChip("catGroup", state.category, categories);
      goto(cur + 1);
      return;
    }
    alert("Elige una categoría o escribe algo para inferirla.");
    return;
  }
  if (cur === 2 && !state.fabric) {
    alert("Elige el tipo de tela.");
    return;
  }
  goto(cur + 1);
}

document.querySelectorAll(".next").forEach(b => b.addEventListener("click", next));
document.querySelectorAll(".prev").forEach(b => {
  b.addEventListener("click", () => {
    const cur = steps.findIndex(s => !s.hidden) + 1;
    goto(cur - 1);
  });
});
document.querySelector(".generate").addEventListener("click", () => {
  gen();
  goto(4);
  saveRecent();
  renderRecents();
});
document.querySelector(".new").addEventListener("click", () => location.reload());

// ── Input wiring ──────────────────────────────────────────────
document.getElementById("desc").addEventListener("input", e => (state.desc = e.target.value));
document.getElementById("oil").addEventListener("change", e => (state.oil = e.target.checked));
document.getElementById("smartthings").addEventListener("change", e => (state.smartthings = e.target.checked));

// ── Dark mode ─────────────────────────────────────────────────
const darkToggle = document.getElementById("darkToggle");

function applyDark(on) {
  document.body.classList.toggle("dark-mode", on);
  darkToggle.textContent = on ? "☀️" : "🌙";
  darkToggle.setAttribute("aria-label", on ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

// Restore saved preference; default to system preference
const savedDark = localStorage.getItem("darkMode");
if (savedDark !== null) {
  applyDark(savedDark === "true");
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyDark(prefersDark);
}

darkToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-mode");
  applyDark(isDark);
  localStorage.setItem("darkMode", isDark);
});

// ── Init ──────────────────────────────────────────────────────
renderChips("catGroup", categories, "category");
renderChips("fabricGroup", fabrics, "fabric");
seg("soil",      "soil",  "soil");
seg("steam",     "steam", "steam");
seg("hsteam",    "hsteam","hsteam");
seg("rinse",     "rinse", "rinse");
seg("dryerPref", "dryer", "dryer");
goto(1);

// Autocomplete suggestions
const dl = document.getElementById("suggestions");
dl.innerHTML = AUTOSUGGEST.map(s => `<option value="${s}">`).join("");

// ── Category inference ────────────────────────────────────────
function inferCategory(text) {
  const map = [
    { k: ["trapo", "paño", "cocina", "microfibra"], id: "traposCocina" },
    { k: ["tapete", "alfombra"],                    id: "tapetes" },
    { k: ["toalla"],                                id: "toallas" },
    { k: ["cobija eléctrica", "calienta", "eléctrica"], id: "cobijaElectrica" },
    { k: ["cobija", "edredón", "sábana", "funda", "bedding", "cobertor"], id: "bedding" },
    { k: ["jean", "mezclilla", "denim"],            id: "jeans" },
    { k: ["pijama", "pijamas", "sleepwear"],        id: "pijamas" },
    { k: ["deportiva", "dryfit", "sport", "gym", "licra"], id: "deportiva" },
    { k: ["seda", "satín", "encaje", "lencería", "delicad"], id: "delicada" },
  ];
  for (const m of map) {
    if (m.k.some(w => text.includes(w))) return m.id;
  }
  return "mixta";
}

// ── Recent washes ─────────────────────────────────────────────
function getRecents() {
  try { return JSON.parse(localStorage.getItem("recentWashes") || "[]"); }
  catch (_) { return []; }
}

function saveRecent() {
  const rec = getRecents();
  const entry = { ts: Date.now(), state: { ...state } };
  rec.unshift(entry);
  const unique = [];
  const seen = new Set();
  for (const r of rec) {
    const key = JSON.stringify({
      c: r.state.category, f: r.state.fabric,
      soil: r.state.soil, oil: r.state.oil,
      steam: r.state.steam, hsteam: r.state.hsteam,
      rinse: r.state.rinse, d: r.state.dryer,
    });
    if (!seen.has(key)) { seen.add(key); unique.push(r); }
    if (unique.length >= 5) break;
  }
  localStorage.setItem("recentWashes", JSON.stringify(unique));

  // Increment drum clean wash count
  const count = parseInt(localStorage.getItem("drumCleanCount") || "0", 10);
  localStorage.setItem("drumCleanCount", count + 1);
}

function recLabel(s) {
  const cat  = (categories.find(c => c.id === s.category) || {});
  const fab  = (fabrics.find(f => f.id === s.fabric) || {});
  const oil  = s.oil ? "con aceite" : "sin aceite";
  return `${cat.icon || ""} ${cat.label || "Mixta"} · ${fab.label || "—"} · ${s.soil} · ${oil}`;
}

function renderRecents() {
  const rec = getRecents();
  const card = document.getElementById("recentsCard");
  const wrap = document.getElementById("recents");
  if (rec.length === 0) { card.hidden = true; wrap.innerHTML = ""; return; }
  card.hidden = false;
  wrap.innerHTML = "";
  rec.forEach(r => {
    const row = document.createElement("div");
    row.className = "recItem";
    const m = document.createElement("div");
    m.className = "recMeta";
    m.textContent = recLabel(r.state);
    const btn = document.createElement("button");
    btn.className = "recBtn";
    btn.textContent = "Usar";
    btn.onclick = () => {
      Object.assign(state, r.state);
      activateChip("catGroup",    state.category, categories);
      activateChip("fabricGroup", state.fabric,   fabrics);
      goto(3);
    };
    row.appendChild(m);
    row.appendChild(btn);
    wrap.appendChild(row);
  });
}
renderRecents();

// ── Main generation ───────────────────────────────────────────
function gen() {
  // Washer defaults
  const r = {
    cycle: "Normal", temp: "Cold", spin: "Medium",
    extras: [], detergent: "Líquido regular", stPreset: null,
  };
  // Dryer defaults
  const d = {
    cycle: "Normal", heat: "Medio", dryness: "Normal Dry",
    notes: [], stPreset: null, skip: false, air: false,
  };

  // ── Category rules ──
  switch (state.category) {
    case "deportiva":
      Object.assign(r, { cycle: "Sportswear", temp: "Cold", spin: "Medium", detergent: "Deporte (sin suavizante)", stPreset: "Sportswear" });
      r.extras.push("Extra Rinse");
      d.cycle = "Active Wear"; d.heat = "Bajo"; d.dryness = "Damp Dry";
      d.notes.push("Evita sobre-secado para proteger la elasticidad.");
      break;
    case "delicada":
      Object.assign(r, { cycle: "Delicates", temp: "Cold", spin: "Low", detergent: "Suave / delicados", stPreset: "Delicates" });
      d.cycle = "Delicates"; d.heat = "Bajo"; d.dryness = "Damp Dry";
      d.notes.push("Ideal colgar al aire. Usa secadora solo si la etiqueta lo permite.");
      break;
    case "jeans":
      Object.assign(r, { cycle: "Denim", temp: "Cold", spin: "Medium", detergent: "Regular", stPreset: "Denim" });
      d.cycle = "Jeans"; d.heat = "Alto"; d.dryness = "More Dry";
      d.notes.push("Voltea al revés para preservar el color.");
      break;
    case "bedding":
      Object.assign(r, { cycle: "Bedding", temp: "Warm", spin: "Medium", detergent: "Potente", stPreset: "Bedding" });
      r.extras.push("Extra Rinse");
      d.cycle = "Bedding"; d.heat = "Medio-Alto"; d.dryness = "More Dry";
      d.notes.push("Añade pelotas de secado para esponjar.");
      break;
    case "cobijaElectrica":
      Object.assign(r, { cycle: "Bedding (personalizado)", temp: "Cold", spin: "Low", detergent: "Suave", stPreset: "Cobija eléctrica" });
      r.extras.push("Sin Steam");
      d.skip = true;
      d.notes.push("No usar secadora · Seca plano al aire, sin calor directo.");
      break;
    case "tapetes":
      Object.assign(r, { cycle: "Bedding", temp: "Warm", spin: "Medium", detergent: "Potente", stPreset: "Bedding" });
      r.extras.push("Extra Rinse");
      d.skip = true;
      d.notes.push("Mejor secar al aire · Secadora puede dañar bases antideslizantes.");
      break;
    case "toallas":
      Object.assign(r, { cycle: "Normal", temp: "Warm", spin: "High", detergent: "Regular", stPreset: "Normal + Extra Rinse" });
      r.extras.push("Extra Rinse");
      d.cycle = "Normal"; d.heat = "Alto"; d.dryness = "More Dry";
      d.notes.push("No uses suavizante: reduce absorción. Usa vinagre blanco si quieres suavidad.");
      break;
    case "traposCocina":
      Object.assign(r, { cycle: "Normal", temp: "Warm", spin: "High", detergent: "Enzimático potente", stPreset: "Normal + Extra Rinse" });
      if (state.soil === "light") r.soil = "normal";
      r.extras.push("Extra Rinse");
      d.cycle = "Normal"; d.heat = "Medio-Alto"; d.dryness = "More Dry";
      d.notes.push("Si hubo mucha grasa, usa Sanitize / Steam Sanitize+ si está disponible.");
      break;
    case "pijamas":
      Object.assign(r, { cycle: "Delicates", temp: "Cold", spin: "Medium", detergent: "Suave", stPreset: "Delicates" });
      d.cycle = "Delicates"; d.heat = "Bajo-Medio"; d.dryness = "Normal Dry";
      d.notes.push("Franela acepta Medio · Modal/satín prefieren secado al aire.");
      break;
    case "mixta":
    default:
      Object.assign(r, { cycle: "Normal", temp: "Cold", spin: "Medium", detergent: "Líquido regular", stPreset: "AI Wash / Normal" });
      d.cycle = "Normal"; d.heat = "Medio"; d.dryness = "Normal Dry";
      break;
  }

  // ── Fabric overrides ──
  if (state.fabric === "modal" || state.fabric === "satin") {
    r.temp = "Cold"; r.spin = "Low";
    if (r.cycle.includes("Bedding")) r.cycle = "Bedding (personalizado)";
    d.heat = "Bajo"; d.dryness = "Damp Dry";
    d.notes.push("Modal/satín: preferible secar al aire.");
  }
  if (state.fabric === "franela" && (state.category === "bedding" || state.category === "pijamas")) {
    r.temp = "Warm";
  }
  if (state.fabric === "mezclilla") {
    r.cycle = "Denim"; r.spin = "Medium";
    d.cycle = "Jeans"; d.heat = "Alto";
  }

  // ── Soil overrides ──
  if (state.soil === "heavy") {
    r.temp = r.temp === "Cold" ? "Warm" : r.temp;
    if (!r.extras.includes("Extra Rinse")) r.extras.push("Extra Rinse");
  }

  // ── Oil override ──
  if (state.oil) {
    r.temp = "Warm";
    if (!r.extras.includes("Extra Rinse")) r.extras.push("Extra Rinse");
    r.detergent = "Enzimático potente";
    if (state.category === "traposCocina" || state.category === "toallas") d.dryness = "More Dry";
  }

  // ── Steam logic ──
  const steamAllowed = !(
    state.fabric === "modal" || state.fabric === "satin" ||
    state.category === "cobijaElectrica"
  );
  if (state.steam === "on" && steamAllowed) {
    if (!r.extras.includes("Steam")) r.extras.push("Steam");
  }
  if (state.steam === "off" || !steamAllowed) {
    r.extras = r.extras.filter(x => x !== "Steam");
  }

  // ── Hygiene Steam logic ──
  const hSteamEligible =
    ["algodon", "franela", "microfibra", "mezclilla"].includes(state.fabric) &&
    ["toallas", "traposCocina", "bedding", "jeans", "mixta"].includes(state.category);
  if (state.hsteam === "on" && hSteamEligible) {
    r.cycle = "Hygiene Steam"; r.spin = r.spin === "Low" ? "Medium" : r.spin; r.temp = "Auto del ciclo";
  }
  if (state.hsteam === "auto" && hSteamEligible && (state.oil || state.soil !== "light")) {
    r.cycle = "Hygiene Steam"; r.spin = r.spin === "Low" ? "Medium" : r.spin; r.temp = "Auto del ciclo";
  }

  // ── Rinse override ──
  if (state.rinse === "on"  && !r.extras.includes("Extra Rinse")) r.extras.push("Extra Rinse");
  if (state.rinse === "off") r.extras = r.extras.filter(x => x !== "Extra Rinse");

  // ── Dryer preference ──
  if (state.dryer === "skip") { d.skip = true; d.notes.push("Elegiste no usar secadora."); }
  if (state.dryer === "air")  { d.air  = true; d.notes.push("Extiende en superficie plana o cuelga en sombra con buena ventilación."); }

  // ── SmartThings presets ──
  const washerPreset = state.smartthings
    ? `<div class="result-item ri-full"><span class="ri-label">SmartThings (lavadora)</span><span class="ri-val">${r.stPreset || "—"}</span></div>` : "";
  const dryerPreset = state.smartthings && d.cycle && !d.skip && !d.air
    ? `<div class="result-item ri-full"><span class="ri-label">SmartThings (secadora)</span><span class="ri-val">${d.cycle}</span></div>` : "";

  // ── Build result HTML ──
  const extrasStr = r.extras.length ? r.extras.join(", ") : "—";

  const dryerInner = d.skip
    ? `<div class="result-skip">⛔ No usar secadora · ${d.notes.join(" ")}</div>`
    : d.air
      ? `<div class="result-skip">🌬️ Secado al aire · ${d.notes.join(" ")}</div>`
      : `
        <div class="result-grid">
          <div class="result-item"><span class="ri-label">Ciclo</span><span class="ri-val">${d.cycle}</span></div>
          <div class="result-item"><span class="ri-label">Calor</span><span class="ri-val">${d.heat}</span></div>
          <div class="result-item"><span class="ri-label">Nivel secado</span><span class="ri-val">${d.dryness}</span></div>
          ${dryerPreset}
        </div>
        ${d.notes.length ? `<div class="result-note">${d.notes.join(" ")}</div>` : ""}
      `;

  document.getElementById("result").innerHTML = `
    <div class="result-block washer">
      <h3>🫧 Lavadora (WF22C6400AV/AX)</h3>
      <div class="result-grid">
        <div class="result-item"><span class="ri-label">Ciclo</span><span class="ri-val">${r.cycle}</span></div>
        <div class="result-item"><span class="ri-label">Temperatura</span><span class="ri-val">${r.temp}</span></div>
        <div class="result-item"><span class="ri-label">Centrifugado</span><span class="ri-val">${r.spin}</span></div>
        <div class="result-item"><span class="ri-label">Suciedad</span><span class="ri-val">${cap(state.soil)}</span></div>
        <div class="result-item"><span class="ri-label">Detergente</span><span class="ri-val">${r.detergent}</span></div>
        <div class="result-item"><span class="ri-label">Extras</span><span class="ri-val">${extrasStr}</span></div>
        ${washerPreset}
      </div>
    </div>
    <div class="result-block dryer">
      <h3>🌀 Secado (DVG24C6370V/AX)</h3>
      ${dryerInner}
    </div>
  `;

  // ── Tips ──
  const tipsArr = [];

  if (state.category === "bedding")
    tipsArr.push("🔵 En secadora, usa pelotas de secado para esponjar y reducir el tiempo.");
  if (state.category === "tapetes")
    tipsArr.push("🌿 Seca al aire para evitar daño en bases antideslizantes.");
  if (state.category === "deportiva")
    tipsArr.push("⚡ Evita suavizante: tapa los poros técnicos del tejido y reduce transpirabilidad.");
  if (state.category === "traposCocina")
    tipsArr.push("🍳 Si hay grasa: pretrata con enzimático + considera Sanitize en lavadora.");
  if (state.fabric === "microfibra")
    tipsArr.push("⚠️ La microfibra libera ~700,000 microplásticos por lavada · Usa bolsa Guppyfriend o filtro de microfibras en la manguera de descarga.");
  if (state.oil)
    tipsArr.push("🛢️ Pretrata el aceite con detergente enzimático directo antes de lavar · Enjuague extra recomendado.");
  if (r.temp === "Cold")
    tipsArr.push("❄️ Agua fría = 90% menos energía que agua caliente · Igual de efectivo para la mayoría de cargas.");
  if (state.soil === "light" && !state.oil)
    tipsArr.push("⚡ Suciedad ligera → considera el ciclo 'Quick Wash' para ahorrar agua y tiempo.");
  if (d.air || state.dryer === "air")
    tipsArr.push("💨 El secado al aire reduce también la emisión de microfibras al ambiente.");

  tipsArr.push("📏 No sobrecargues: llena ⅔ del tambor como máximo para un lavado óptimo.");

  document.getElementById("tips").innerHTML =
    `<ul>${tipsArr.map(t => `<li>${t}</li>`).join("")}</ul>`;

  // ── Explanation ──
  document.getElementById("explain").innerHTML = `
    <p>Las recomendaciones se calculan en capas: <strong>(1) categoría</strong> →
    <strong>(2) tipo de tela</strong> → <strong>(3) nivel de suciedad</strong> →
    <strong>(4) aceites / extras</strong>. Las temperaturas frías conservan color y
    consumen menos energía. El centrifugado se reduce para proteger fibras delicadas.
    Hygiene Steam se activa automáticamente en cargas con aceite o suciedad alta
    cuando la tela y la categoría lo permiten.</p>
  `;

  // ── Drum Clean+ reminder ──
  const drum = document.getElementById("drumReminder");
  const triggerCategories = ["traposCocina", "bedding", "tapetes"];
  const shouldRemind = state.oil || triggerCategories.includes(state.category);

  const lastRun   = localStorage.getItem("drumCleanLast");
  const washCount = parseInt(localStorage.getItem("drumCleanCount") || "0", 10);
  const now       = new Date();
  const daysSince = lastRun ? Math.round((now - new Date(lastRun)) / (1000 * 60 * 60 * 24)) : null;
  const washesSinceClean = parseInt(localStorage.getItem("drumCleanSince") || "0", 10) + 1;
  localStorage.setItem("drumCleanSince", washesSinceClean);

  let msg = "";
  if (shouldRemind) {
    msg = "💧 Sugerido: ejecuta <strong>Drum Clean+</strong> al terminar esta carga (residuos de grasa o volumen).";
  } else if (washesSinceClean >= 40) {
    msg = `💧 Han pasado ~${washesSinceClean} lavados desde el último <strong>Drum Clean+</strong>. Recomendado cada 40 lavados.`;
  } else if (daysSince === null || daysSince >= 60) {
    msg = "💧 Recuerda correr <strong>Drum Clean+</strong> cada 40 lavados o cada 2–3 meses.";
  }

  if (msg) {
    drum.hidden = false;
    drum.innerHTML = `<p>${msg} <button id="markDrum" class="secondary" style="margin-top:8px;display:inline-block">✓ Marcar como realizado</button></p>`;
    document.getElementById("markDrum").onclick = () => {
      localStorage.setItem("drumCleanLast", new Date().toISOString());
      localStorage.setItem("drumCleanSince", "0");
      drum.innerHTML = "<p>✅ Guardé la fecha del Drum Clean+. ¡Tambor listo!</p>";
    };
  } else {
    drum.hidden = true;
  }
}

// ── Share ─────────────────────────────────────────────────────
document.getElementById("share").addEventListener("click", async () => {
  const res =
    document.getElementById("result").innerText + "\n\nTips:\n" +
    document.getElementById("tips").innerText;
  if (navigator.share) {
    try { await navigator.share({ title: "Configuración de lavado/secado", text: res }); }
    catch (_) {}
  } else {
    await navigator.clipboard.writeText(res);
    alert("Configuración copiada al portapapeles.");
  }
});

// ── PWA install prompt ────────────────────────────────────────
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  const a = document.getElementById("install");
  a.hidden = false;
  a.onclick = () => e.prompt();
});

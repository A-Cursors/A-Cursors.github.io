import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");
const loading = document.getElementById("detailLoading");
const errorBox = document.getElementById("detailError");
const content = document.getElementById("detailContent");

function esc(value = "") { return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function showError() { loading.classList.add("hidden"); errorBox.classList.remove("hidden"); }
function lineBreaks(value = "") { return esc(value).replace(/\n/g, "<br>"); }

async function loadCursor() {
  if (!id) return showError();
  try {
    const snap = await getDoc(doc(db, "cursors", id));
    if (!snap.exists()) return showError();
    const d = snap.data();
    document.title = `${d.name || "Cursor"} — A-Cursors`;
    document.getElementById("detailTitle").textContent = d.name || "Untitled Cursor";
    document.getElementById("detailCategory").textContent = d.category || "Cursor";
    document.getElementById("detailDescription").textContent = d.description || "A custom cursor from A-Cursors.";
    document.getElementById("mainImage").src = d.imageUrl || "";
    document.getElementById("mainImage").alt = d.name || "Cursor preview";
    document.getElementById("downloadButton").href = d.downloadUrl || "#";

    const version = document.getElementById("detailVersion");
    if (d.version) { version.textContent = `v${d.version}`; version.classList.remove("hidden"); }

    const meta = [["Creator", d.creator], ["Version", d.version], ["Size", d.size], ["Category", d.category]].filter(x => x[1]);
    document.getElementById("detailMeta").innerHTML = meta.map(([k,v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");

    const gallery = [d.imageUrl, ...(d.gallery || [])].filter(Boolean);
    const uniqueGallery = [...new Set(gallery)];
    const thumbs = document.getElementById("thumbnailRow");
    const images = document.getElementById("detailImages");
    thumbs.innerHTML = uniqueGallery.map((url,i) => `<button class="thumb ${i===0 ? "active" : ""}" data-image="${esc(url)}"><img src="${esc(url)}" alt="Preview ${i+1}"></button>`).join("");
    images.innerHTML = uniqueGallery.map(url => `<img src="${esc(url)}" alt="${esc(d.name || "Cursor")} preview" loading="lazy">`).join("");
    thumbs.querySelectorAll(".thumb").forEach(btn => btn.addEventListener("click", () => { document.getElementById("mainImage").src = btn.dataset.image; thumbs.querySelectorAll(".thumb").forEach(x => x.classList.remove("active")); btn.classList.add("active"); }));

    const instructionSection = document.getElementById("instructionsSection");
    if (d.instructions) document.getElementById("detailInstructions").innerHTML = lineBreaks(d.instructions); else instructionSection.classList.add("hidden");
    const keywordSection = document.getElementById("keywordsSection");
    const keywords = d.keywords || [];
    if (keywords.length) document.getElementById("keywordList").innerHTML = keywords.map(k => `<span>${esc(k)}</span>`).join(""); else keywordSection.classList.add("hidden");
    if (!d.gallery?.length) document.getElementById("screenshotsSection").querySelector("h2").textContent = "Product preview";

    loading.classList.add("hidden"); content.classList.remove("hidden");
  } catch (e) { console.error(e); showError(); }
}

document.getElementById("year").textContent = new Date().getFullYear();
const savedTheme = localStorage.getItem("a-cursors-theme"); if (savedTheme === "light") document.body.classList.add("light-theme");
document.getElementById("themeToggle")?.addEventListener("click", () => { document.body.classList.toggle("light-theme"); localStorage.setItem("a-cursors-theme", document.body.classList.contains("light-theme") ? "light" : "dark"); });
loadCursor();

import { db } from "./firebase-config.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const grid = document.getElementById("cursorGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const resultCount = document.getElementById("resultCount");
const categoryList = document.getElementById("categoryList");
let allCursors = [];

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function normalize(value = "") { return value.toLowerCase().trim(); }

function cardTemplate(item) {
  const d = item.data;
  return `<a class="cursor-card" href="cursor.html?id=${encodeURIComponent(item.id)}">
    <div class="card-image"><img src="${esc(d.imageUrl)}" alt="${esc(d.name)}" loading="lazy"><span class="card-category">${esc(d.category || "Cursor")}</span></div>
    <div class="card-body"><h3>${esc(d.name)}</h3><p>${esc(d.description || "Custom cursor pack")}</p><div class="card-bottom"><span>${esc(d.creator || "A-Cursors")}</span><span class="arrow">↗</span></div></div>
  </a>`;
}

function render(list) {
  resultCount.textContent = `${list.length} ${list.length === 1 ? "cursor" : "cursors"}`;
  if (!list.length) { grid.innerHTML = ""; emptyState.classList.remove("hidden"); return; }
  emptyState.classList.add("hidden");
  grid.innerHTML = list.map(cardTemplate).join("");
}

function renderCategories() {
  const cats = [...new Set(allCursors.map(x => x.data.category).filter(Boolean))].sort();
  categoryList.innerHTML = cats.length ? cats.map(c => `<button class="category-chip" data-category="${esc(c)}">${esc(c)}</button>`).join("") : `<span class="muted-text">Categories will appear here as you add cursors.</span>`;
  categoryList.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { searchInput.value = btn.dataset.category; filter(); document.getElementById("latest").scrollIntoView({behavior:"smooth"}); }));
}

function filter() {
  const term = normalize(searchInput.value);
  if (!term) return render(allCursors);
  const filtered = allCursors.filter(({data:d}) => [d.name,d.category,d.creator,d.description,d.version,d.size,...(d.keywords || [])].join(" ").toLowerCase().includes(term));
  render(filtered);
}

async function load() {
  try {
    const snap = await getDocs(query(collection(db, "cursors"), orderBy("createdAt", "desc")));
    allCursors = snap.docs.map(doc => ({id: doc.id, data: doc.data()}));
    render(allCursors); renderCategories();
  } catch (error) {
    console.error(error);
    grid.innerHTML = `<div class="error-box">Could not load the cursor collection. Check your Firebase configuration and Firestore rules.</div>`;
    resultCount.textContent = "Error";
  }
}

searchInput?.addEventListener("input", filter);
document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchInput.focus(); } });
document.getElementById("year").textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem("a-cursors-theme");
if (savedTheme === "light") document.body.classList.add("light-theme");
document.getElementById("themeToggle")?.addEventListener("click", () => { document.body.classList.toggle("light-theme"); localStorage.setItem("a-cursors-theme", document.body.classList.contains("light-theme") ? "light" : "dark"); });

load();

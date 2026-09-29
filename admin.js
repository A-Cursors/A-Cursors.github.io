import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const loading = document.getElementById("adminLoading");
const app = document.getElementById("adminApp");
const form = document.getElementById("cursorForm");
const message = document.getElementById("adminMessage");
const list = document.getElementById("adminList");

let editingId = null;
let cached = [];


function $(id) {
  return document.getElementById(id);
}


function esc(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[c])
  );
}


function showMessage(text, error = false) {
  message.textContent = text;
  message.className = `form-message ${
    error ? "error-message" : "success-message"
  }`;
}


function parseList(value) {
  return value
    .split(/\n|,/)
    .map(x => x.trim())
    .filter(Boolean);
}


/* =========================
   LOAD CURSORS
========================= */

async function loadCursors() {

  try {

    const cursorQuery = query(
      collection(db, "cursors"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(cursorQuery);

    cached = snap.docs.map(item => ({
      id: item.id,
      data: item.data()
    }));

    $("adminCount").textContent = `${cached.length} total`;

    if (!cached.length) {

      list.innerHTML = `
        <div class="empty-admin">
          No cursors yet. Add your first one using the form.
        </div>
      `;

      return;
    }


    list.innerHTML = cached
      .map(({ id, data }) => {

        const image = esc(
          data.imageUrl ||
          "https://via.placeholder.com/300x200?text=A-Cursors"
        );

        return `
          <div class="admin-item">

            <img
              src="${image}"
              alt="${esc(data.name || "Cursor")}"
            >

            <div class="admin-item-info">

              <strong>
                ${esc(data.name || "Unnamed Cursor")}
              </strong>

              <span>
                ${esc(data.category || "Cursor")}
              </span>

            </div>


            <div class="admin-item-actions">

              <a
                href="cursor.html?id=${encodeURIComponent(id)}"
                target="_blank"
              >
                View
              </a>

              <button data-edit="${id}">
                Edit
              </button>

              <button
                class="delete-btn"
                data-delete="${id}"
              >
                Delete
              </button>

            </div>

          </div>
        `;

      })
      .join("");


    list
      .querySelectorAll("[data-edit]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => startEdit(button.dataset.edit)
        );

      });


    list
      .querySelectorAll("[data-delete]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => removeCursor(button.dataset.delete)
        );

      });

  } catch (error) {

    console.error("LOAD CURSORS ERROR:", error);

    list.innerHTML = `
      <div class="empty-admin">
        Could not load cursors.
        Check your Firestore configuration and rules.
      </div>
    `;

  }

}


/* =========================
   EDIT
========================= */

function fill(data, id) {

  editingId = id;

  $("cursorId").value = id;

  $("name").value = data.name || "";
  $("category").value = data.category || "";
  $("creator").value = data.creator || "";
  $("version").value = data.version || "";
  $("size").value = data.size || "";

  $("downloadUrl").value = data.downloadUrl || "";
  $("imageUrl").value = data.imageUrl || "";

  $("description").value = data.description || "";

  $("keywords").value =
    (data.keywords || []).join(", ");

  $("gallery").value =
    (data.gallery || []).join("\n");

  $("instructions").value =
    data.instructions || "";


  $("formHeading").textContent =
    "Edit cursor";

  $("saveBtn").textContent =
    "Save changes";

  $("cancelEdit").classList.remove("hidden");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function startEdit(id) {

  const item = cached.find(
    x => x.id === id
  );

  if (item) {
    fill(item.data, id);
  }

}


/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  editingId = null;

  form.reset();

  $("cursorId").value = "";

  $("formHeading").textContent =
    "Add a cursor";

  $("saveBtn").textContent =
    "Add cursor";

  $("cancelEdit").classList.add("hidden");

  message.textContent = "";

  message.className =
    "form-message";

}


/* =========================
   ADD / UPDATE
========================= */

form.addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    const data = {

      name:
        $("name").value.trim(),

      category:
        $("category").value.trim(),

      creator:
        $("creator").value.trim(),

      version:
        $("version").value.trim(),

      size:
        $("size").value.trim(),

      downloadUrl:
        $("downloadUrl").value.trim(),

      imageUrl:
        $("imageUrl").value.trim(),

      description:
        $("description").value.trim(),

      keywords:
        parseList($("keywords").value),

      gallery:
        parseList($("gallery").value),

      instructions:
        $("instructions").value.trim()

    };


    const button =
      $("saveBtn");

    button.disabled = true;


    showMessage(
      editingId
        ? "Saving changes..."
        : "Adding cursor..."
    );


    try {

      if (editingId) {

        await updateDoc(
          doc(
            db,
            "cursors",
            editingId
          ),
          data
        );

      } else {

        await addDoc(
          collection(
            db,
            "cursors"
          ),
          {
            ...data,
            createdAt:
              serverTimestamp()
          }
        );

      }


      const wasEditing =
        Boolean(editingId);

      clearForm();

      showMessage(
        wasEditing
          ? "Cursor updated successfully."
          : "Cursor added successfully."
      );


      await loadCursors();


    } catch (error) {

      console.error(
        "SAVE CURSOR ERROR:",
        error
      );

      showMessage(
        "Could not save the cursor. Check your Firestore rules.",
        true
      );

    } finally {

      button.disabled = false;

    }

  }
);


/* =========================
   DELETE
========================= */

async function removeCursor(id) {

  if (
    !confirm(
      "Delete this cursor? This cannot be undone."
    )
  ) {
    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        "cursors",
        id
      )
    );


    if (editingId === id) {
      clearForm();
    }


    await loadCursors();

    showMessage(
      "Cursor deleted successfully."
    );


  } catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );

    showMessage(
      "Could not delete the cursor.",
      true
    );

  }

}


/* =========================
   BUTTONS
========================= */

$("clearBtn")
  ?.addEventListener(
    "click",
    clearForm
  );


$("cancelEdit")
  ?.addEventListener(
    "click",
    clearForm
  );


$("logoutBtn")
  ?.addEventListener(
    "click",
    () => {
      window.location.href =
        "login.html";
    }
  );


/* =========================
   THEME
========================= */

const savedTheme =
  localStorage.getItem(
    "a-cursors-theme"
  );


if (savedTheme === "light") {
  document.body.classList.add(
    "light-theme"
  );
}


$("themeToggle")
  ?.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "light-theme"
      );

      localStorage.setItem(
        "a-cursors-theme",

        document.body.classList.contains(
          "light-theme"
        )
          ? "light"
          : "dark"
      );

    }
  );


/* =========================
   START ADMIN PANEL
========================= */

async function startAdminPanel() {

  console.log(
    "A-Cursors Admin Panel starting..."
  );


  loading.classList.add(
    "hidden"
  );

  app.classList.remove(
    "hidden"
  );


  await loadCursors();

}


/* START */

startAdminPanel();
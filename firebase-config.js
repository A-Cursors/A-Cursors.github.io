import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// A-Cursors Firebase Web App configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXc8HjiYQGVfWMtU1c10xj8Ah488bx8c",
  authDomain: "a-cursors.firebaseapp.com",
  projectId: "a-cursors",
  storageBucket: "a-cursors.firebasestorage.app",
  messagingSenderId: "85077560849",
  appId: "1:85077560849:web:f280309ba392af78e76bb0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

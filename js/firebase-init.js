// Fieldstock — Firebase client SDK init (not used yet)
//
// Current setup doesn't need this: the frontend talks to Firebase only
// through the Django backend (see js/config.js + API_BASE_URL).
// This file is here for later, if you add something that needs the
// frontend to talk to Firebase directly — e.g. Firebase Storage for
// product images, or real-time stock updates.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjp4oKSzSIX6cjVo1qeFAB8IRas9WpJrc",
  authDomain: "fieldstock-store.firebaseapp.com",
  projectId: "fieldstock-store",
  storageBucket: "fieldstock-store.firebasestorage.app",
  messagingSenderId: "756635891871",
  appId: "1:756635891871:web:f3b1c5bef19ce7b3d4caaa"
};

const app = initializeApp(firebaseConfig);

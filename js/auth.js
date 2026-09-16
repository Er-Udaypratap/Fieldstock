/* Fieldstock — auth (now calls the Django + Firebase backend) */

const SESSION_KEY = "fieldstock_session"; // { token, uid, email, name }

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

function currentUserName() {
  const session = getSession();
  return session ? session.name || session.email : null;
}

/**
 * Calls POST /api/auth/register/
 * Returns { ok: true } or { ok: false, message }
 */
async function registerUser(name, email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.error || "Registration failed." };
    }

    // Registration succeeded — log the user in right away
    return await loginUser(email, password);
  } catch (err) {
    return { ok: false, message: "Could not reach the server. Is the backend running?" };
  }
}

/**
 * Calls POST /api/auth/login/
 * On success, stores the Firebase ID token + profile in localStorage.
 */
async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.error || "Login failed." };
    }

    setSession({
      token: data.idToken,
      uid: data.uid,
      email: data.email,
      name: data.name
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, message: "Could not reach the server. Is the backend running?" };
  }
}

function updateAccountLink() {
  const el = document.querySelector("[data-account-link]");
  if (!el) return;
  const name = currentUserName();
  if (name) {
    el.textContent = name.split(" ")[0];
    el.setAttribute("href", "#");
    el.onclick = (e) => {
      e.preventDefault();
      logoutUser();
      window.location.href = "index.html";
    };
  } else {
    el.textContent = "Login";
    el.setAttribute("href", "login.html");
  }
}

document.addEventListener("DOMContentLoaded", updateAccountLink);

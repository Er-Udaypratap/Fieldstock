# Fieldstock — Frontend (connected to the Django + Firebase backend)

This is the same HTML/CSS/JS frontend, updated to talk to the real backend
instead of using mock localStorage data.

## What changed from the standalone version

- `js/config.js` — new file, holds `API_BASE_URL`. Change this if your
  Django server runs somewhere other than `http://127.0.0.1:8000`.
- `js/products.js` — no longer has a hardcoded product list. It now calls
  `GET /api/products/` and stores the result in the `PRODUCTS` array.
- `js/auth.js` — `registerUser()` and `loginUser()` now call
  `POST /api/auth/register/` and `POST /api/auth/login/`. On success, the
  Firebase ID token is saved in localStorage under `fieldstock_session`.
- `js/main.js` — page init now waits for products to load before rendering,
  and the checkout form sends the order to `POST /api/orders/` with the
  logged-in user's token in the `Authorization` header.
- `js/cart.js` — unchanged. Cart stays in localStorage for a fast add/remove
  experience; it's only sent to the backend once, at checkout.

## Running it

1. Start the Django backend first (see the backend project's README):
   ```
   python manage.py runserver
   ```
   It should be running at `http://127.0.0.1:8000`.

2. Open this frontend. Since it now makes `fetch()` calls, opening
   `index.html` directly as a `file://` path can cause CORS issues in some
   browsers — serve it instead:
   ```
   python -m http.server 5500
   ```
   Then visit `http://127.0.0.1:5500` in your browser.

3. Register a new account, then log in — checkout requires being logged in,
   since orders are tied to a Firebase user.

## Troubleshooting

- **Products don't load / empty catalog page** → backend isn't running, or
  you haven't run `python manage.py seed_products` yet on the backend.
- **"Could not reach the server"** on login/register/checkout → check the
  Django server is running and `API_BASE_URL` in `js/config.js` matches it.
- **CORS error in the browser console** → make sure `django-cors-headers`
  is installed and listed in `INSTALLED_APPS`/`MIDDLEWARE` in the backend's
  `settings.py` (it already is if you're using the provided backend).

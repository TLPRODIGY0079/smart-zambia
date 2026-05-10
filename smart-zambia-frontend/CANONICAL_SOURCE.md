# Which frontend is authoritative?

Netlify publishes the **`public/`** directory (`netlify.toml` → `publish = "public"`). That makes **`public/index.html`** plus **`public/js/`** the **canonical production surface**.

This **`smart-zambia-frontend/`** tree is maintained as a **mirror** when we change inlined app behaviour (for example Easter-egg logic) so local copies opened from here do not silently drift.

**Rule of thumb**

1. Implement user-facing behaviours in **`public/`** first.
2. Mirror the same blocks into **`smart-zambia-frontend/index.html`** (and shared JS copies under `smart-zambia-frontend/js/` when they differ).
3. If parity ever feels too costly, consolidate on `public/` only and archive this folder in a tracked decision—until then, keep both aligned.

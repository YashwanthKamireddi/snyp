# Snyp — A Full-Stack URL Shortener

Snyp turns long links into short ones. Paste a URL, optionally pick your own
custom code, and get a short link — every time someone visits it they're
redirected to the original, while Snyp counts the clicks. Built as a single
full-stack project: a **React** frontend, an **Express** API, and a **SQLite**
database.

> Submitted for the Fluentgrid UI / Database internship assessment (Option 2 —
> Backend URL Shortener), extended into a full-stack app with a frontend.

---

## What it does

- **Shorten** any valid `http`/`https` URL into a short key (e.g. `/9nShhC1`).
- **Custom codes** — optionally choose your own code, like `/my-portfolio`.
- **Redirect** visitors from the short link to the original URL.
- **Count clicks** on every short link.
- **Archive view** listing every link created, with its destination and click count.
- **Validation & errors** — bad URLs and taken/invalid codes are rejected with a
  clear message; unknown short links return a clean 404.

---

## Tech stack & why

| Layer    | Choice                        | Why |
|----------|-------------------------------|-----|
| Frontend | **React + Vite**              | Component-based UI; Vite gives instant dev reloads and a fast build. |
| Backend  | **Node.js + Express**         | Minimal, well-understood framework for clean REST endpoints. |
| Database | **SQLite** (`better-sqlite3`) | A real SQL database in a single file — zero setup, perfect for this scope. |
| Keys     | **nanoid**                    | Generates short, URL-safe, collision-resistant keys. |

Frontend and backend are both JavaScript, so it's a single-language full-stack app.

---

## Project structure

```
.
├── client/                 # React + Vite frontend
│   ├── index.html
│   └── src/
│       ├── App.jsx             # layout + state (the list of links)
│       ├── api.js              # all calls to the backend
│       ├── components/
│       │   ├── ShortenForm.jsx # url + custom code input, copy, errors
│       │   └── UrlList.jsx     # the archive table
│       └── styles.css
├── server/                 # Express + SQLite backend
│   └── src/
│       ├── index.js            # app setup; serves the API + built frontend
│       ├── db.js               # SQLite connection + queries
│       ├── lib/
│       │   ├── validateUrl.js  # URL validation
│       │   └── validateCode.js # custom-code validation
│       └── routes/
│           ├── urls.js         # POST /api/shorten, GET /api/urls
│           └── redirect.js     # GET /:key  → redirect
├── package.json            # root scripts (build / start the whole app)
└── render.yaml             # deployment config
```

---

## API

| Method | Endpoint        | Description                                            |
|--------|-----------------|--------------------------------------------------------|
| `POST` | `/api/shorten`  | Body `{ "url": "https://…", "customCode"?: "my-link" }` → returns the short link. |
| `GET`  | `/api/urls`     | Lists every shortened link (newest first).             |
| `GET`  | `/:key`         | Redirects to the original URL (302) and counts a click. 404 if unknown. |

Custom codes must be 3–20 characters (letters, numbers, hyphens). A taken code
returns `409`; an invalid one returns `400`.

---

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

**1. Install everything**

```bash
npm run install:all
```

**2. Start the backend** (terminal 1)

```bash
npm run dev:server      # → http://localhost:3001
```

**3. Start the frontend** (terminal 2)

```bash
npm run dev:client      # → http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` calls to the
backend automatically.

### Run as one service (production mode)

```bash
npm run build           # installs deps + builds the React app
npm start               # → http://localhost:3001  (serves UI + API together)
```

---

## Deployment

The app is configured to deploy to [Render](https://render.com) as a single web
service (`render.yaml` is included):

1. Push this repository to GitHub.
2. On Render, choose **New → Blueprint** and point it at the repo.
3. Render runs `npm run build` then `npm start`. Done.

> Note: on Render's free tier the SQLite file is reset when the service restarts
> or redeploys. That's fine for a demo; for permanent storage, attach a Render
> persistent disk or switch to a hosted database.

---

## Notes

- All user input is validated **on the server** — the frontend can't be trusted.
- SQL runs through **prepared statements**, which prevents SQL injection.
- Short links use a **302** (temporary) redirect so click counts keep updating
  (a 301 would be cached permanently by browsers).
- SQLite runs in **WAL mode** for better read/write concurrency.

# Aurora Market

Full-stack e-commerce store: **React** storefront + **Node.js / Express** API, with JWT auth, product catalog, cart, checkout, order history, and an admin inventory screen.

## Run it

```bash
npm install
npm run install:all
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/health

## Demo accounts

| Role     | Email              | Password |
| -------- | ------------------ | -------- |
| Customer | demo@aurora.dev    | demo123  |
| Admin    | admin@aurora.dev   | admin123 |

## What is in this project

- `client/` — Vite + React, HTML/CSS UI, React Router, cart in localStorage
- `server/` — Express REST API, bcrypt passwords, JWT sessions
- `server/data/db.json` — created on first start (JSON database, no extra DB install)

## API map

- `POST /api/auth/register` `POST /api/auth/login` `GET /api/auth/me`
- `GET /api/products` `GET /api/products/:id` (admin: POST/PUT/DELETE)
- `GET /api/orders` `POST /api/orders` (admin: patch status)

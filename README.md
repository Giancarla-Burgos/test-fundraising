# RaiseKit 🚀

**A full-stack fundraising copilot for student organizations and small nonprofits.**

> Generate a practical fundraising strategy, outreach templates, and a step-by-step action plan — instantly. Save your playbooks, revisit them anytime, and build on them as your campaign evolves.

---

## What's new in this version

RaiseKit has evolved from a static GitHub Pages site into a **full-stack web application** with:

- ✅ User accounts (sign up, log in, log out)
- ✅ Session-based authentication with bcrypt password hashing
- ✅ A personal dashboard to manage your saved playbooks
- ✅ Save, view, and delete fundraising playbooks
- ✅ All the original generator features, now backed by a real database
- ✅ Clean, polished UI consistent with the original branding

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Templates | EJS |
| Database | SQLite (via better-sqlite3) |
| Auth | express-session + bcryptjs |
| Validation | express-validator |
| Env vars | dotenv |

---

## Project structure

```
/
├── server.js               ← Express entry point
├── package.json
├── .env.example            ← Copy to .env and fill in values
├── routes/
│   ├── auth.js             ← /signup, /login, /logout
│   ├── dashboard.js        ← /dashboard
│   └── playbooks.js        ← /generator, /generate, /playbooks
├── models/
│   └── db.js               ← SQLite connection + schema + query helpers
├── views/
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── nav.ejs
│   │   └── footer.ejs
│   ├── index.ejs           ← Landing page
│   ├── login.ejs
│   ├── signup.ejs
│   ├── dashboard.ejs
│   ├── generator.ejs
│   ├── playbook.ejs        ← Saved playbook detail
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   ├── style.css           ← All styles
│   └── generator.js        ← Client-side plan generation + save logic
├── middleware/
│   └── requireAuth.js      ← Route guard for protected pages
└── utils/
    └── generator.js        ← Server-side plan generation logic
```

---

## Local setup

### Prerequisites

- Node.js 18+ and npm

### 1. Clone the repository

```bash
git clone https://github.com/Giancarla-Burgos/test-fundraising.git
cd test-fundraising
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set a strong `SESSION_SECRET`:

```bash
# Generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as your `SESSION_SECRET` in `.env`.

### 4. Start the server

```bash
npm start
```

The server will start at **http://localhost:3000**.

The SQLite database is created automatically at `./data/raisekit.db` on first run — no migration step needed.

### Development mode (auto-restart on file changes)

```bash
npm run dev
```

---

## Routes

| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| GET | `/` | Landing page | No |
| GET | `/signup` | Sign up form | No |
| POST | `/signup` | Create account | No |
| GET | `/login` | Login form | No |
| POST | `/login` | Authenticate | No |
| POST | `/logout` | Destroy session | No |
| GET | `/dashboard` | User dashboard | **Yes** |
| GET | `/generator` | Generator form | **Yes** |
| POST | `/generate` | Generate plan (JSON) | **Yes** |
| POST | `/playbooks` | Save a playbook | **Yes** |
| GET | `/playbooks/:id` | View saved playbook | **Yes** |
| POST | `/playbooks/:id/delete` | Delete a playbook | **Yes** |

---

## Security notes

- Passwords are hashed with **bcrypt** (12 rounds) — plaintext passwords are never stored.
- Sessions use `httpOnly`, `SameSite=Lax` cookies. Set `NODE_ENV=production` to enable `secure` (HTTPS-only) cookies.
- Input is validated and sanitized on both client and server via **express-validator**.
- Session secrets are read from environment variables — never hardcoded.
- **CSRF protection**: Currently using `SameSite=Lax` as a baseline. For production, add a dedicated CSRF token middleware (e.g., [`csrf-csrf`](https://www.npmjs.com/package/csrf-csrf)) before state-changing POST routes.

---

## Deployment

> ⚠️ **GitHub Pages cannot host this app.** GitHub Pages only serves static files and has no server-side runtime. RaiseKit now requires a real backend host.

### Recommended deployment options

| Platform | Notes |
|----------|-------|
| **Railway** | Simple git-push deploys, free tier available, SQLite works fine |
| **Render** | Easy Node.js hosting, persistent disk for SQLite |
| **Fly.io** | More control, supports persistent volumes for SQLite |
| **Heroku** | Classic PaaS, note that ephemeral filesystem needs a swap to PostgreSQL for production persistence |
| **VPS (DigitalOcean, Linode, etc.)** | Full control, run with `pm2` for process management |

### Production checklist

- [ ] Set `NODE_ENV=production` in your host's environment variables
- [ ] Set a strong, unique `SESSION_SECRET`
- [ ] Use HTTPS (most platforms handle this automatically)
- [ ] Consider swapping SQLite for PostgreSQL if you expect high concurrent writes
- [ ] Add CSRF protection middleware (`csrf-csrf`)
- [ ] Set up regular database backups

---

## Original MVP features (preserved)

- Strategy generator tailored to org type, goal, and timeline
- 4-week action timeline (adjusts to 2-week or 3-month horizons)
- Donor outreach email template
- Grant category starter list
- Copyable checklist
- "What to do today" action box
- Preset one-click examples
- Copy-to-clipboard for any section
- Download full plan as .txt

---

*Built by [Giancarla Burgos](https://github.com/Giancarla-Burgos)*

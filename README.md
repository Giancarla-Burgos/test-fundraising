# RaiseKit 🚀

**A full-stack fundraising copilot for student organizations and small nonprofits.**

> Generate a practical fundraising strategy, outreach templates, and a step-by-step action plan — instantly. Save your playbooks, revisit them anytime, and build on them as your campaign evolves.

---

## What's in this version

RaiseKit is a full-stack web application with:

- ✅ User accounts (sign up, log in, log out)
- ✅ Session-based authentication with bcrypt password hashing
- ✅ CSRF protection on every state-changing route
- ✅ A personal dashboard to manage saved playbooks
- ✅ Save, view, and delete fundraising playbooks
- ✅ **Supabase (PostgreSQL)** as the database backend
- ✅ All the original generator features, now backed by a real database
- ✅ Clean, polished UI consistent with the original RaiseKit branding

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Templates | EJS |
| Database | Supabase (PostgreSQL) |
| ORM/Client | @supabase/supabase-js |
| Session store | session-file-store (local files) |
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
├── supabase/
│   └── schema.sql          ← Run this once in Supabase SQL Editor
├── routes/
│   ├── auth.js             ← /signup, /login, /logout
│   ├── dashboard.js        ← /dashboard
│   └── playbooks.js        ← /generator, /generate, /playbooks
├── models/
│   └── db.js               ← Supabase client + async query helpers
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

- Node.js 18+
- A free [Supabase](https://supabase.com) account and project

### 1. Clone the repository

```bash
git clone https://github.com/Giancarla-Burgos/test-fundraising.git
cd test-fundraising
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your Supabase tables

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates the `users` and `playbooks` tables.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
SESSION_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Find your Supabase credentials at: **Project Settings → API**
- **URL** — the Project URL
- **service_role** key — under "Project API keys" (keep this private!)

### 5. Start the server

```bash
npm start
```

App runs at **http://localhost:3000**.

### Development mode (auto-restart)

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

## Security

- **Passwords** — hashed with bcrypt (12 rounds); never stored in plaintext
- **Sessions** — `httpOnly`, `SameSite=Lax` cookies; `Secure` flag enabled in production
- **CSRF** — synchronizer token pattern: a random token is generated per session, embedded in all forms, and validated on every `POST`/`PUT`/`DELETE` request
- **Session fixation** — session is regenerated after login
- **Timing attacks** — login always runs `bcrypt.compare()` even when the user doesn't exist
- **Input validation** — all form fields validated and sanitized with express-validator
- **Supabase key** — the `service_role` key is server-only and never exposed to the browser

---

## Deployment

> ⚠️ **GitHub Pages cannot host this app.** GitHub Pages only serves static files and has no Node.js runtime. RaiseKit requires a real backend host.

### Recommended deployment options

| Platform | Notes |
|----------|-------|
| **Railway** | Simple git-push deploys, free tier, connects easily to Supabase |
| **Render** | Easy Node.js hosting, add env vars in dashboard |
| **Fly.io** | More control, works great with external Postgres/Supabase |
| **Heroku** | Classic PaaS, set env vars with `heroku config:set` |
| **VPS (DigitalOcean, Linode)** | Full control, run with `pm2` |

### Production checklist

- [ ] Set `NODE_ENV=production` in your host's env vars
- [ ] Set a strong, unique `SESSION_SECRET`
- [ ] Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Use HTTPS (most platforms handle this automatically)
- [ ] For multi-instance deployments, swap `session-file-store` for a Redis or PostgreSQL-backed session store

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

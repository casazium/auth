# Casazium Auth

[![Coverage Status](https://coveralls.io/repos/github/casazium/auth/badge.svg?branch=main)](https://coveralls.io/github/casazium/auth?branch=main)

**Casazium Auth** is a lightweight, self-hostable authentication service built for developers and indie creators.

It provides a simple API to support:

- ✅ Passwordless login via magic links
- ✅ Optional password-based login
- ✅ Access + refresh JWT token flows
- ✅ SQLite-based storage
- ✅ Email integration via SMTP
- ✅ Developer-friendly environment configuration

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- SQLite3
- An SMTP server or MailDev for local testing

### Installation

```bash
git clone https://github.com/casazium/auth.git
cd auth
npm install
```

### Configure Environment

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
BASE_URL=http://localhost:3000
```

---

## 🔐 API Overview

- `POST /register` – Register new user
- `POST /magic-link` – Request a login link
- `GET /magic-link/verify?token=...` – Authenticate via token
- `POST /login` – Login with password
- `POST /token/refresh` – Refresh access token
- `POST /logout` – Invalidate refresh token
- `GET /me` – Return current authenticated user (token required)

---

## 🧰 Development

To initialize the local database:

```bash
node src/db/init.js
```

Then run the app:

```bash
node index.js
```

---

## 🙋 Feedback & Contributions

Casazium Auth is built by [@rcasazza](https://github.com/rcasazza) and open to feedback and contributions.

- Found a bug? [Open an issue](https://github.com/casazium/auth/issues)
- Want to discuss features? [Start a discussion](https://github.com/casazium/auth/discussions)
- Want to contribute? See `CONTRIBUTING.md`

---

## 📄 License

MIT © Casazium

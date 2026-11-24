# Deploying the Voxlate website

The website is a Next.js app with API routes, sign-in and server-rendered pages, so it needs a host
that **builds and runs Next.js** (Netlify or Vercel). A plain static drag-and-drop upload will not work.

## Website (this folder)

**Netlify** — New site → *Import from Git* (or `npx netlify deploy --build --prod` from this folder).
`netlify.toml` already sets the build command, output folder and Node 22.

**Vercel** — New project → import the repository. No extra settings needed.

Set these environment variables on the host (see `.env.local.example`):

| Variable | Value |
| --- | --- |
| `API_BASE_URL` | Backend URL, e.g. `https://voxlate-wait.onrender.com` |
| `NEXT_PUBLIC_API_BASE_URL` | Same backend URL |
| `NEXTAUTH_URL` | The site's own URL, e.g. `https://voxlate.example` |
| `NEXTAUTH_SECRET` | Long random string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in |

## Backend (`backend/`, on Render)

Deploying `main` is enough. The backend keeps using the `DATABASE_URL` and `JWT_SECRET` it
already has; nothing new is required:

- **Database:** the new `questions` / `contact_messages` data and the new question fields need no
  migration on MongoDB (collections are created on first save). Running `npm run db:push` once
  adds speed-up indexes; it is optional.
- **Admin sign-in:** the only way in is the normal `/login` page: type `admin` in the email field and
  the admin password. There is no separate admin sign-in page, `/admin` shows "page not found" to
  anyone who isn't a signed-in admin, and admins get a small shield icon in the navbar that opens the
  dashboard. The code holds only a one-way bcrypt hash of the password. To change it, set `ADMIN_PASSWORD_HASH` (raw or base64) on Render:
  `node -e "console.log(Buffer.from(require('bcryptjs').hashSync(process.argv[1], 12)).toString('base64'))" "<new password>"`.
  `ADMIN_USERNAME` and `ADMIN_EMAIL` are optional overrides too.

Optional extras:

- Email notifications: `QUESTIONS_NOTIFY_EMAIL`, `CONTACT_NOTIFY_EMAIL`, `INVESTOR_NOTIFY_EMAIL`,
  and emailing answers to people who asked, all need `RESEND_API_KEY`.
- `FRONTEND_URL` should list the website's URL (used only if the browser ever calls the API
  directly; normal traffic goes through the website's own `/api` proxy).

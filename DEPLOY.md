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

After pulling these changes:

1. Redeploy the backend.
2. Run `npx prisma db push` once (adds the `questions` and `contact_messages` collections).
3. Set the admin sign-in variables:
   - `ADMIN_USERNAME` — `admin`
   - `ADMIN_PASSWORD_HASH` — bcrypt hash of the admin password, raw or base64
     (`node -e "console.log(Buffer.from(require('bcryptjs').hashSync(process.argv[1], 12)).toString('base64'))" "<password>"`)
   - `ADMIN_EMAIL` — the email the admin account uses
4. Optional email notifications: `QUESTIONS_NOTIFY_EMAIL`, `CONTACT_NOTIFY_EMAIL`, `INVESTOR_NOTIFY_EMAIL` (needs `RESEND_API_KEY`).
5. Make sure `FRONTEND_URL` lists the website's URL so the browser can reach the API.

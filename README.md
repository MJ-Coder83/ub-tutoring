# UB Tutoring

Expert online GCSE & A-Level Economics tutoring website.

**Live site:** https://mj-coder83.github.io/ub-tutoring/

Published via GitHub Pages from the `main` branch. A second copy is deployed on Vercel.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole page |
| `styles.css` | All styling (mobile-first, CSS custom properties) |
| `app.js` | Nav, mobile menu, FAQ accordion, enquiry form |
| `api/enquiry.js` | Vercel serverless function that emails enquiries |
| `images/` | Site images (self-hosted — nothing is hotlinked) |

No build step. Open `index.html`, or serve the folder:

```bash
python -m http.server 8000
```

## Enquiry form

The form posts JSON and only shows the success panel once a send is actually
confirmed. If the send fails, the visitor sees an error with direct contact
details instead of a false confirmation.

The endpoint is chosen at runtime in `app.js`:

- **Vercel** → `POST /api/enquiry` (our own handler)
- **GitHub Pages** → FormSubmit, because Pages is static-only and cannot run server code

### Configuring the Vercel handler

`api/enquiry.js` sends mail through [Resend](https://resend.com) (free tier:
3,000 emails/month). Set these environment variables in the Vercel dashboard
under **Settings → Environment Variables**, then redeploy:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | API key from the Resend dashboard |
| `CONTACT_TO` | `umartnba.1992@gmail.com` |
| `CONTACT_FROM` | `UB Tutoring <onboarding@resend.dev>` until a custom domain is verified in Resend |

Enquiries arrive with the sender's address as `Reply-To`, so replying from the
inbox goes straight back to the parent.

### Activating the GitHub Pages fallback

FormSubmit needs a one-time activation: submit the form once on the live Pages
site, then click the confirmation link it emails to `umartnba.1992@gmail.com`.
Until that is done, submissions to the Pages copy will not be delivered.

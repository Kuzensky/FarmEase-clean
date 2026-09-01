# FarmEase

FarmEase is a Next.js e-commerce application for agricultural products. It includes Clerk authentication, MongoDB persistence, Cloudinary product uploads, Inngest order and user events, seller views, and an agricultural chatbot.

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy the safe environment template and add your own values:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run build
```

## Security

Never commit `.env`, `.env.local`, or provider credentials. All environment files are ignored except `.env.example`, which contains placeholders only. The chatbot API key is used exclusively by the server-side `/api/chat` route and is never sent to the browser.

If a credential has ever been committed, deleting the file in a later commit is not sufficient. Revoke or rotate the credential at its provider and use a clean-history repository before sharing the project again.

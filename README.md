# ShopThread

See [plan.md](./plan.md) for the full product spec. This README covers running the app day to day.

## Setup

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Copy `.env.local.example` to `.env.local` and fill in the three Supabase values from
   **Project Settings → API** (Project URL, anon key, service role key).
3. Apply the schema in `supabase/migrations/0001_init.sql` to that project — either paste it into
   the Supabase SQL editor, or link the CLI and push it (no Docker required for either):

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

4. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` (magic link email) to
   create your store, then visit `/<your-store-slug>` for the public storefront.

## Testing

```bash
npm run test
```

Covers the pure logic in `lib/` (pricing, the bulk-import parser, the WhatsApp message
formatter). No Supabase connection is needed to run these.

## Notes on auth

The plan describes phone-OTP sign-in for vendors. This build uses Supabase email magic links
instead, since phone OTP needs an SMS provider (e.g. Twilio) configured in the Supabase dashboard.
Swapping to phone auth later is a small change in `lib/actions/auth.ts` and `app/login/page.tsx`.

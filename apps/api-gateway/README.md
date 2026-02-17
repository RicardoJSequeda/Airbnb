## 🔧 Environment Variables

### Backend Setup

1. **Copy the example file:**
   ```bash
   cd apps/api-gateway
   cp .env.example .env
   ```

2. **Update the values:**
   ```env
   # JWT_SECRET is REQUIRED - app fails to start without it (no fallback for security)
   JWT_SECRET=use_a_strong_random_string_here
   
   # Get your Stripe keys from https://dashboard.stripe.com/test/apikeys
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Generate JWT Secret (recommended):**
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Or using OpenSSL
   openssl rand -hex 64
   ```

### Frontend Setup

1. **Copy the example file:**
   ```bash
   cd apps/web
   cp .env.example .env.local
   ```

2. **Update the values:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Running tests

- **Unit tests** (`pnpm test`): No env required.
- **E2E tests** (`pnpm test:e2e`): Require `.env` with `JWT_SECRET`, `DATABASE_URL`, etc. (or equivalent env vars in CI).

### ⚠️ Security Notes

- **NEVER** commit `.env` files to Git
- Use different secrets for development/production
- Rotate secrets periodically
- Use strong, randomly generated secrets (min 32 characters)
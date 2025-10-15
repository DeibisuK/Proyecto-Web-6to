# Auth & Roles in API Gateway

This document explains how to set up custom claims (roles) in Firebase and how the API Gateway verifies them.

## Assign a role to a user (using Firebase Admin or gateway endpoint)

This project stores a single role per user in the custom claim `role` (string). The gateway exposes an admin endpoint to set/replace the user's role.

Example direct Node script using Firebase Admin:

```js
const admin = require('firebase-admin');
admin.initializeApp({/* credentials via GOOGLE_APPLICATION_CREDENTIALS */});

async function setRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log('Role assigned');
}

setRole('USER_UID', 'admin').catch(console.error);
```

Alternatively, the gateway offers a protected endpoint (requires admin): `POST /admin/assign-role` with JSON body `{ "uid": "...", "role": "admin" }`. This replaces any prior role on the user's custom claims.

After setting a custom claim, the user's ID token must be refreshed on the client side (sign out/in or call `getIdToken(true)`).

## How gateway checks roles

The gateway's `authenticate` middleware (factory) verifies the ID token and then checks claims. It supports two styles:

- `roles` claim as an array: e.g. `roles: ['admin', 'staff']`
- boolean claims directly on the token: e.g. `admin: true`

Usage examples in `src/app.js`:

```js
const authenticate = require('./middleware/authenticate');

// Require admin role
app.use('/admin', authenticate(['admin']), proxy(process.env.ADMIN_SERVICE_URL));

// No role required
app.use('/u', authenticate(), proxy(process.env.USER_SERVICE_URL));
```

## Security notes

- Don't embed service account JSON in the repo. Use environment secrets.
- For production, consider short-lived tokens and revocation checking (`AUTH_CHECK_REVOKED=true`).
- Optionally, enforce role checks in microservices as an additional layer.

## Troubleshooting

- If a user gets 401 with `token_revoked`, force refresh the token on client: `getIdToken(true)` or sign out/in.
- If a user has role but gateway returns 403, inspect the token using the Firebase Admin SDK locally:
  `admin.auth().verifyIdToken(idToken).then(console.log)`

*** End of file ***

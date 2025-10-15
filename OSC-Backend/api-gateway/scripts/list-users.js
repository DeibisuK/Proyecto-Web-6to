/**
 * Script to list Firebase Authentication users and their custom 'role' claim.
 * Run from the api-gateway folder with:
 *   node scripts/list-users.js
 * It requires GOOGLE_APPLICATION_CREDENTIALS env var or other admin credentials available.
 */
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (err) {
    console.error('Failed to initialize firebase-admin:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

async function listAllUsers() {
  const results = [];
  let nextPageToken = undefined;
  try {
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        const role = userRecord.customClaims && (userRecord.customClaims.role || userRecord.customClaims.roles) ? (userRecord.customClaims.role || userRecord.customClaims.roles) : null;
        results.push({ uid: userRecord.uid, email: userRecord.email || null, displayName: userRecord.displayName || null, role });
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(JSON.stringify({ count: results.length, users: results }, null, 2));
  } catch (err) {
    console.error('Error listing users:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

listAllUsers();

/**
 * Middleware to extract user information from headers set by API Gateway.
 * API Gateway forwards Firebase user info via x-user-uid and x-user-email headers
 * after successful authentication.
 * 
 * This middleware attaches req.user with:
 * - uid: Firebase UID (from x-user-uid header)
 * - email: User email (from x-user-email header)
 * 
 * For local PostgreSQL users, the system currently only supports Firebase auth.
 * Future enhancement could include a separate header for local user ID.
 */
function extractUser(req, res, next) {
  const uid = req.header('x-user-uid');
  const email = req.header('x-user-email');

  if (!uid) {
    // No user info in headers means authentication failed or wasn't required
    return res.status(401).json({ 
      error: 'unauthorized', 
      message: 'Authentication required. User information missing from request.' 
    });
  }

  // Attach user info to request object for downstream use
  req.user = {
    uid: uid,
    email: email || null
  };

  next();
}

export default extractUser;

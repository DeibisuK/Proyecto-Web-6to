import fetch from 'node-fetch';

/**
 * Middleware to extract user information from headers set by API Gateway.
 * API Gateway forwards Firebase user info via x-user-uid and x-user-email headers
 * after successful authentication.
 * 
 * This middleware attaches req.user with:
 * - uid: Firebase UID (from x-user-uid header)
 * - email: User email (from x-user-email header)
 * - role: User role (from x-user-role header or user-service)
 * 
 * For local PostgreSQL users, the system currently only supports Firebase auth.
 * Future enhancement could include a separate header for local user ID.
 */
async function extractUser(req, res, next) {
  const uid = req.header('x-user-uid');
  const email = req.header('x-user-email');

  if (!uid) {
    // No user info in headers means authentication failed or wasn't required
    return res.status(401).json({ 
      error: 'unauthorized', 
      message: 'Authentication required. User information missing from request.' 
    });
  }

  // Try to get role from headers first
  let role = req.header('x-user-role');
  const name = req.header('x-user-name');
  
  // If no role in headers, try to fetch from user-service
  if (!role) {
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${userServiceUrl}/users/${uid}`);
      if (response.ok) {
        const userData = await response.json();
        // Map id_rol to role name
        const roleMap = { 1: 'admin', 2: 'superadmin', 3: 'user' };
        role = userData.rol || roleMap[userData.id_rol] || 'user';
      }
    } catch (error) {
      console.warn('Could not fetch user role from user-service:', error.message);
    }
  }
  
  // Attach user info to request object for downstream use
  req.user = {
    uid: uid,
    email: email || null,
    role: role || 'user',
    name: name || email?.split('@')[0] || 'Usuario',
    displayName: name || email?.split('@')[0] || 'Usuario'
  };

  next();
}

export default extractUser;

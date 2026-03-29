const authenticateSession = (req, res, next) => {
  if (req.session?.user) {
    // Map session user (legacy compatibility or standardized naming)
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Session expired or not authenticated. Please log in again.",
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    authenticateSession(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Resource restricted to ${roles.join(", ")} only.`,
        });
      }
      next();
    });
  };
};

export const requireAuth = authenticateSession;
export const adminOnly = authorizeRoles("admin");
export const organiserOnly = authorizeRoles("organiser", "admin");

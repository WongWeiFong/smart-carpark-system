const jwt = require("jsonwebtoken");

function auth(requiredRole) {
  return (req, res, next) => {
    try {
      const h = req.headers.authorization || "";
      const token = h.startsWith("Bearer ") ? h.slice(7) : null;
      if (!token) return res.status(401).json({ error: "Missing token" });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // optional role check
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload; // { sub, email, role }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

module.exports = { auth };

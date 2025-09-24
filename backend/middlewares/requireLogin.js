const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor." });
  }
  next();
};

module.exports = requireLogin;

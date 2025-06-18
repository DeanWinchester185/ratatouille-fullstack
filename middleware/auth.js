async function isAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

async function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role_id === 1) {
    next();
  } else {
    res.redirect("/profile");
  }
}

module.exports = { isAuth, isAdmin };

const { verifyToken } = require("../helpers/jwt");

function authentication(req, res, next) {
  try {
    let access_token = req.headers.authorization;

    if (!access_token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (access_token.startsWith("Bearer ")) {
      access_token = access_token.split(" ")[1];
    }

    const payload = verifyToken(access_token);

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authentication };

const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password, role } = req.body;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const user = await User.create({ username, email, password, role });
      res
        .status(201)
        .json({ id: user.id, username: user.username, email: user.email });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid email/password" });
      }

      const valid = comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email/password" });
      }

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const access_token = signToken(payload);
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;

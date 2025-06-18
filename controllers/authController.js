const { User } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

class AuthController {
  async register(req, res) {
    const { login, email, password } = req.body;

    const findRecord = await User.findOne({
      where: {
        [Op.or]: [{ email }, { login }],
      },
      paranoid: false,
    });

    if (findRecord) {
      if (findRecord.email === email) {
        return res.status(400).json({ message: "Пользователь уже зарегистрирован с такой почтой" });
      }
      if (findRecord.login === login) {
        return res.status(400).json({ message: "Пользователь уже зарегистрирован с таким логином" });
      }
    } else {
      const user = await User.create({ login, email, password });
      if (user) {
        const userData = {
          id: user.id,
          login: user.login,
          email: user.email,
          role_id: user.role_id,
        };
        req.session.user = userData;
        res.redirect("/profile");
      } else {
        res.redirect("/register");
      }
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, deletedAt: null } });
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      if (user.role_id === 1) {
        const userData = {
          id: user.id,
          login: user.login,
          email: user.email,
          role_id: user.role_id,
        };
        req.session.user = userData;
        res.redirect("/admin");
      } else {
        const userData = {
          id: user.id,
          login: user.login,
          email: user.email,
          role_id: user.role_id,
        };
        req.session.user = userData;
        res.redirect("/profile");
      }
    } else {
      res.status(400).json({ message: "Пароль не верен" });
    }
  }

  async logout(req, res) {
    req.session.destroy(function () {
      res.clearCookie("session");
      res.redirect("/login");
    });
  }

  async deleteAccount(req, res) {
    const { id } = req.session.user;
    await User.destroy({ where: { id } });
    req.session.destroy(function () {
      res.clearCookie("session");
      res.redirect("/");
    });
  }
}

module.exports = new AuthController();

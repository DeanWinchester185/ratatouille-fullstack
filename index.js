const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const session = require("express-session");
const express = require("express");
const { sequelize, Role, User, CookingCategories } = require("./models");

const isDev = process.env.NODE_ENV == "dev" ? true : false;
const sessionSecret = process.env.SESSION_SECRET;
const app = express();

const webRouter = require("./routes/web.routes");
const authRouter = require("./routes/auth.router");

app.use(
  session({
    name: "session",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 48 * 60 * 60 * 1000,
    },
  }),
);
if (!isDev) {
  const publicPath = path.join(__dirname, "public");
  const cssPath = path.join(publicPath, "styles");
  const jsPath = path.join(publicPath, "js");

  app.use(
    "/styles",
    express.static(cssPath, {
      maxAge: "30d",
    }),
  );
  app.use(
    "/js",
    express.static(jsPath, {
      maxAge: "30d",
    }),
  );
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.all("*", webRouter);
app.all("*", authRouter);
app.set("view engine", "hbs");

(async () => {
  try {
    await sequelize.authenticate();

    if (isDev) {
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync();
    }

    const [adminRole, createdAdmin] = await Role.findOrCreate({
      where: { name: "admin" },
      defaults: { name: "admin" },
    });

    const [userRole, createdUser] = await Role.findOrCreate({
      where: { name: "user" },
      defaults: { name: "user" },
    });

    await User.findOrCreate({
      where: { login: "admin" },
      defaults: {
        login: "admin",
        email: "admin@admin.com",
        password: "1",
        role_id: adminRole.id,
      },
    });

    const categories = ["Варка", "Жарка", "В духовке"];
    for (const categoryName of categories) {
      await CookingCategories.findOrCreate({
        where: { name: categoryName },
        defaults: { name: categoryName },
      });
    }
  } catch (error) {
    console.log("Ошибка запуска бд:", error);
  }
})();

app.listen(80);

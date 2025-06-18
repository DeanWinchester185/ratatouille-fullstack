const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const {
  User,
  Favorite,
  Recipe,
  Ingredient,
  CookingSteps,
  CookingCategories,
  Nutrient,
  RecipeRequest,
  Review,
} = require("../models");
const { Op } = require("sequelize");
const { isAuth, isAdmin } = require("../middleware/auth");

const AuthController = require("../controllers/authController");
const { convertToPng } = require("../utils/imageConverter");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/delete", AuthController.deleteAccount);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/temp/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now() + Math.random());
  },
});

const upload = multer({ storage: storage });
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "step_image[]", maxCount: 10 },
]);

router.get("/profile", isAuth, async (req, res) => {
  let avatar = false;
  const avatarPath = path.join(__dirname, `../public/images/avatars/${req.session.user.id}.png`);

  try {
    await fs.access(avatarPath, fs.constants.F_OK);
    avatar = true;
  } catch (error) {}

  const isAdmin = req.session.user.role_id === 1 ? true : false;

  res.render("profile", { isAdmin: isAdmin, user: req.session.user, avatar: avatar });
});

router.post("/avatar", isAuth, upload.single("avatar"), async (req, res) => {
  const image = req.file;
  if (image) {
    await convertToPng(image.path, req.session.user.id);
    res.redirect("/profile");
  } else {
    res.json({ message: "Прикрепите файл для обновления аватара" });
  }
});

router.get("/favorite", isAuth, async (req, res) => {
  const favorites = await Favorite.findAll({
    where: { user_id: req.session.user.id },
    include: { model: Recipe },
  });
  if (req.session.user) {
    res.render("favorite", { favorites, user: req.session.user });
  } else {
    res.render("favorite", { favorites });
  }
});

router.post("/favorite/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  const { returnUrl } = req.body;
  const favorite = await Favorite.findOne({ where: { recipe_id: id, user_id: req.session.user.id } });
  if (favorite) {
    await Favorite.destroy({ where: { id: favorite.id } });
  } else {
    await Favorite.create({ recipe_id: id, user_id: req.session.user.id });
  }
  res.redirect(returnUrl || "/favorite");
});

router.post("/reviews/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  const { text, rate } = req.body;

  if (!id || !text || !rate) {
    return res.status(400).json({ message: "Заполните все поля" });
  }

  await Review.create({
    user_id: req.session.user.id,
    recipe_id: id,
    text: text,
    rate: rate,
  });
  const allReview = await Review.findAll({
    where: { recipe_id: id },
  });

  let averageRating = 0;
  if (allReview.length > 0) {
    const sumOfRatings = allReview.reduce((sum, review) => {
      const reviewRate = parseFloat(review.rate);
      return sum + reviewRate;
    }, 0);
    averageRating = sumOfRatings / allReview.length;
  }

  const updateRating = await Recipe.findOne({
    where: { id: id },
  });
  updateRating.rating = averageRating;
  await updateRating.save();

  res.redirect(`/recipes/${id}`);
});

router.get("/shared", isAuth, async (req, res) => {
  const cookingCategories = await CookingCategories.findAll();
  res.render("shared", { categories: cookingCategories });
});

router.post("/shared", isAuth, uploadFields, async (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
      ingredient_name,
      ingredient_amount,
      ingredient_unit,
      step_number,
      step_description,
      calories,
      proteins,
      fats,
      carbohydrates,
    } = req.body;

    const recipe = await Recipe.create({
      name,
      description,
      rating: 0.0,
      category_id: category_id,
    });

    for (let i = 0; i < ingredient_name.length; i++) {
      await Ingredient.create({
        recipe_id: recipe.id,
        name: ingredient_name[i],
        amount: ingredient_amount[i],
        unit: ingredient_unit[i],
      });
    }

    for (let i = 0; i < step_number.length; i++) {
      await CookingSteps.create({
        recipe_id: recipe.id,
        step_number: step_number[i],
        step_description: step_description[i],
      });
    }

    await Nutrient.create({
      recipe_id: recipe.id,
      calories: calories,
      proteins: proteins,
      fats: fats,
      carbohydrates: carbohydrates,
    });

    await RecipeRequest.create({
      user_id: req.session.user.id,
      recipe_id: recipe.id,
    });

    if (req.files["image"] && req.files["image"][0]) {
      try {
        const image = req.files["image"][0];
        await convertToPng(image.path, null, recipe.id);
      } catch (error) {
        console.error("Ошибка при конвертации главного изображения:", error);
      }
    }

    if (req.files["step_image[]"]) {
      for (const [index, file] of req.files["step_image[]"].entries()) {
        try {
          console.log(`Обработка файла: ${file.path}`);
          await convertToPng(file.path, null, recipe.id, index);
          console.log(`Файл обработан: ${file.path}`);
        } catch (error) {
          console.error(`Ошибка при обработке изображения ${index + 1}:`, error);
        }
      }
    }

    res.redirect("/profile");
  } catch (error) {
    console.error("Ошибка сервера", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/admin", isAuth, async (req, res) => {
  res.render("admin");
});

router.get("/admin/users", isAdmin, async (req, res) => {
  const users = await User.findAll(
    {
      where: {
        id: {
          [Op.ne]: req.session.user.id,
        },
      },
    },
    { attributes: ["id", "login", "email", "password"] },
  );
  res.render("adminUsers", { users });
});

router.post("/admin/users/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  if (id == req.session.user.id) {
    res.json({ error: "Вы не можете удалить самого себя" });
  } else {
    await User.destroy({ where: { id } });
    await Review.destroy({ where: { user_id: id } });
    res.redirect("/admin/users");
  }
});

router.get("/admin/shared", isAdmin, async (req, res) => {
  const recipe_requests = await RecipeRequest.findAll({
    include: { model: User, where: { role_id: { [Op.ne]: 1 } }, attributes: ["login"] },
  });
  res.render("adminShared", { recipe_requests });
});

router.get("/admin/shared/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  const recipe_req = await RecipeRequest.findOne({
    where: { id },
    include: { model: User, where: { role_id: { [Op.ne]: 1 } } },
  });
  if (recipe_req) {
    const recipe = await Recipe.findOne({ where: { id: recipe_req.id } });
    const category = await CookingCategories.findOne({
      where: { id: recipe.category_id },
    });
    const ingredient = await Ingredient.findAll({ where: { recipe_id: recipe_req.id } });
    const cookingsteps = await CookingSteps.findAll({ where: { recipe_id: recipe_req.id } });
    const nutrient = await Nutrient.findAll({ where: { recipe_id: recipe_req.id } });
    res.render("adminSharedSelect", { recipe, category, recipe_req, ingredient, cookingsteps, nutrient });
  } else {
    res.json("Этот рецепт уже опубликован");
  }
});

router.post("/admin/shared/apply/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  await RecipeRequest.update({ user_id: req.session.user.id }, { where: { id } });

  res.redirect("/admin/shared");
});

router.post("/admin/shared/reject/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findOne({ where: { id: id } });

  await RecipeRequest.destroy({ where: { recipe_id: recipe.id } });
  await recipe.destroy({ where: { id } });
  await Ingredient.destroy({ where: { recipe_id: recipe.id } });
  await CookingSteps.destroy({ where: { recipe_id: recipe.id } });
  await Nutrient.destroy({ where: { recipe_id: recipe.id } });
  res.redirect("/admin/shared");
});

router.get("/admin/recipes", isAdmin, async (req, res) => {
  const recipes = await Recipe.findAll({ attributes: ["id", "name"] });
  res.render("adminRecipes", { recipes });
});

module.exports = router;

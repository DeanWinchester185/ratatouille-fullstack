const express = require("express");
const router = express.Router();
const {
  sequelize,
  User,
  Recipe,
  Ingredient,
  Favorite,
  Nutrient,
  CookingSteps,
  CookingCategories,
  RecipeRequest,
  Review,
} = require("../models");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  const categories = await CookingCategories.findAll();

  const recipeRequests = await RecipeRequest.findAll({
    include: [
      {
        model: Recipe,
      },
      {
        model: User,
        where: {
          role_id: 1,
        },
        attributes: [],
      },
    ],
  });

  const recipes = recipeRequests.map((recipe) => recipe.Recipe);
  if (req.session.user) {
    res.render("index", { user: req.session.user, categories: categories, recipes: recipes });
  } else {
    res.render("index", { categories: categories, recipes: recipes });
  }
});

router.get("/categories/:id", async (req, res) => {
  const { id } = req.params;

  const recipes = await RecipeRequest.findAll({
    include: [{ model: Recipe, where: { category_id: id } }],
  });

  const cookingcategories = await CookingCategories.findOne({
    where: { id: id },
  });

  let title;
  if (cookingcategories) {
    title = cookingcategories.name;
  } else {
    title = "Категория не найдена";
  }
  res.render("category", { title: title, recipes: recipes, user: req.session.user });
});

router.get("/recipes/search", async (req, res) => {
  const { query } = req.query;
  let recipes = [];

  if (query) {
    const queryRecipe = {};
    queryRecipe.name = { [Op.iLike]: `%${query}%` };

    const recipeRequests = await RecipeRequest.findAll({
      include: [
        {
          model: Recipe,
          where: queryRecipe,
        },
        {
          model: User,
          where: {
            role_id: 1,
          },
          attributes: [],
        },
      ],
    });
    recipes = recipeRequests.map((recipeRequest) => recipeRequest.Recipe);
  }
  const user = req.session.user ? true : false;
  res.render("search", { recipes, user: user });
});

router.get("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findByPk(id, {
    include: [{ model: Ingredient }, { model: Nutrient }, { model: CookingSteps }],
  });
  const reviews = await Review.findAll({
    where: { recipe_id: id },
    include: [{ model: User }],
  });

  const user = req.session.user ? true : false;
  if (req.session.user) {
    const isFavorite = await Favorite.findOne({ where: { recipe_id: id, user_id: req.session.user.id } });
    res.render("recipe", { recipe, isFavorite, returnUrl: req.originalUrl, isAuth: true, reviews, user: user });
  } else {
    res.render("recipe", { recipe, returnUrl: req.originalUrl, reviews, user: user });
  }
});

router.get("/login", async (req, res) => {
  if (!req.session.user) {
    res.render("login");
  } else {
    res.redirect("/profile");
  }
});

router.get("/register", async (req, res) => {
  if (!req.session.user) {
    res.render("register");
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;

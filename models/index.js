const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const userModel = require("./userModel");
const roleModel = require("./roleModel");
const recipeModel = require("./recipeModel");
const ingredientModel = require("./ingredientModel");
const favoriteModel = require("./favoriteModel");
const nutrientModel = require("./nutrientModel");
const recipeRequestModel = require("./recipe_requestModel");
const cookingStepsModel = require("./cooking_stepsModel");
const cookingCategoriesModel = require("./cooking_categoriesModel");
const reviewModel = require("./reviewModel");

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
);

const User = userModel(sequelize);
const Role = roleModel(sequelize);
const Recipe = recipeModel(sequelize);
const Ingredient = ingredientModel(sequelize);
const Favorite = favoriteModel(sequelize);
const Nutrient = nutrientModel(sequelize);
const RecipeRequest = recipeRequestModel(sequelize);
const CookingSteps = cookingStepsModel(sequelize);
const CookingCategories = cookingCategoriesModel(sequelize);
const Review = reviewModel(sequelize);

User.belongsTo(Role, { foreignKey: "role_id", onDelete: "RESTRICT", onUpdate: "CASCADE" });
Role.hasMany(User, {
  foreignKey: "role_id",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Recipe.hasMany(Ingredient, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Ingredient.belongsTo(Recipe, { foreignKey: "recipe_id" });

Recipe.hasMany(Favorite, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Favorite.belongsTo(Recipe, { foreignKey: "recipe_id" });

User.hasMany(Favorite, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Favorite.belongsTo(User, { foreignKey: "user_id" });

Recipe.hasMany(Nutrient, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Nutrient.belongsTo(Recipe, { foreignKey: "recipe_id" });

Recipe.hasMany(RecipeRequest, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
RecipeRequest.belongsTo(Recipe, { foreignKey: "recipe_id" });

User.hasMany(RecipeRequest, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
RecipeRequest.belongsTo(User, { foreignKey: "user_id" });

Recipe.hasMany(CookingSteps, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
CookingSteps.belongsTo(Recipe, { foreignKey: "recipe_id" });

Recipe.belongsTo(CookingCategories, { foreignKey: "category_id", onDelete: "SET NULL", onUpdate: "CASCADE" });
CookingCategories.hasMany(Recipe, {
  foreignKey: "category_id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Review.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Review, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Review.belongsTo(Recipe, { foreignKey: "recipe_id" });
Recipe.hasMany(Review, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 12);
});

module.exports = {
  sequelize,
  User,
  Role,
  Recipe,
  Ingredient,
  Favorite,
  Nutrient,
  RecipeRequest,
  CookingSteps,
  CookingCategories,
  Review,
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RecipeRequest = sequelize.define(
    "RecipeRequest",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Recipes",
          key: "id",
        },
      },
    },
    { paranoid: true },
    { updatedAt: false },
  );
  return RecipeRequest;
};

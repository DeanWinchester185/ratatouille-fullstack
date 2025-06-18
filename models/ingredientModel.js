const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ingredient = sequelize.define("Ingredient", {
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Recipes",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Ingredient;
};

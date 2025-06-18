const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Nutrient = sequelize.define("Nutrient", {
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Recipes",
        key: "id",
      },
    },
    calories: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    proteins: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fats: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    carbohydrates: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });
  return Nutrient;
};

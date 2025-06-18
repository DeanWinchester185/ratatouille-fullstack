const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CookingSteps = sequelize.define("CookingSteps", {
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Recipes",
        key: "id",
      },
    },
    step_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    step_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return CookingSteps;
};

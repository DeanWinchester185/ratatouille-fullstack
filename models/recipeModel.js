const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Recipe = sequelize.define(
    "Recipe",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CookingCategories",
          key: "id",
        },
      },
    },
    { paranoid: true },
  );
  return Recipe;
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define(
    "Review",
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
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rate: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
      },
    },
    { paranoid: true },
  );
  return Review;
};

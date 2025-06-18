const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Favorite = sequelize.define(
    "Favorite",
    {
      recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Recipes",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    { paranoid: true },
  );
  return Favorite;
};

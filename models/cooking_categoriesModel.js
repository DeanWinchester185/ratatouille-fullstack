const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CookingCategories = sequelize.define("CookingCategories", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });
  return CookingCategories;
};
